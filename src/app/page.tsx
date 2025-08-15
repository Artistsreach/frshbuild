"use client";

import { useRouter } from "next/navigation";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { UserButton } from "@stackframe/stack";
import { UserApps } from "@/components/user-apps";
import { ModeToggle } from "@/components/theme-toggle";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { getUserCredits } from "@/actions/get-user-credits";
import { Banknote, CoinsIcon } from "lucide-react";
import { PurchaseModal } from "@/components/purchase-modal";
import { getUser } from "@/actions/get-user";
import Stars from "@/components/ui/stars";

const queryClient = new QueryClient();

function HomePageContent() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const router = useRouter();

  const { data: credits } = useQuery({
    queryKey: ["credits"],
    queryFn: () => getUserCredits(),
    refetchInterval: 5000,
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

  const handleSubmit = async () => {
    setIsLoading(true);

    // window.location = `http://localhost:3000/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`;

    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
    );
  };

  const startFunding = async () => {
    try {
      setFundingLoading(true);
      const res = await fetch("/api/stripe/connect/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start onboarding");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setFundingLoading(false);
    }
  };

  return (
      <main className="min-h-screen p-4 relative">
        <div className="absolute top-0 left-0 w-full h-full -z-10 dark:block hidden">
          <Stars />
        </div>
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-sky-200 to-transparent -z-10 dark:hidden" />
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Moon_rotating_full_220px.gif"
          alt="Rotating Moon"
          width={50}
          height={50}
          className="absolute top-0 left-0 m-[25px] hidden dark:block"
        />
        <div className="flex w-full justify-end items-center">
          <div className="flex items-center gap-2 flex-1 sm:w-80 justify-end">
            <>
              <div
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => setPurchaseModalOpen(true)}
              >
                <CoinsIcon className="h-4 w-4 dark:text-yellow-400" />
                {credits}
              </div>
              <PurchaseModal
                open={purchaseModalOpen}
                onOpenChange={setPurchaseModalOpen}
                userId={user?.id ?? ""}
              />
            </>
            <ModeToggle />
            <UserButton
              extraItems={[
                {
                  text: fundingLoading ? "Opening…" : "Get Funded",
                  onClick: startFunding,
                  icon: <Banknote className="h-4 w-4" />,
                },
              ]}
            />
          </div>
        </div>

        <div>
          <div className="w-full max-w-lg px-4 sm:px-0 mx-auto flex flex-col items-center mt-16 sm:mt-24 md:mt-32 col-start-1 col-end-1 row-start-1 row-end-1 z-10">
            <Image
              className="dark:invert mx-2 mb-4"
              src="https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"
              alt="Adorable Logo"
              width={48}
              height={48}
            />
            <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6 text-2xl sm:text-3xl md:text-4xl font-bold">
              What do you want to build?
            </p>

            <div className="w-full relative my-5">
              <div className="relative w-full max-w-full overflow-hidden">
                <div className="w-full bg-accent rounded-3xl relative z-10 border transition-colors shimmer-border">
                  <PromptInput
                    isLoading={isLoading}
                    value={prompt}
                    onValueChange={setPrompt}
                    onSubmit={handleSubmit}
                    className="relative z-10 border-none bg-transparent shadow-none transition-all duration-200 ease-in-out "
                  >
                    <div id="home-prompt-field">
                      <PromptInputTextareaWithTypingAnimation
                        id="home-prompt-input"
                        name="app_description"
                        autoComplete="on"
                      />
                    </div>
                    <PromptInputActions>
                      <div id="home-build-button">
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isLoading || !prompt.trim()}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2 text-sm font-semibold"
                        >
                          {isLoading ? (
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            "Build It"
                          )}
                        </Button>
                      </div>
                    </PromptInputActions>
                  </PromptInput>
                </div>
              </div>
            </div>
            <FrameworkSelector
              value={framework}
              onChange={setFramework}
            />
            {/* <Examples setPrompt={setPrompt} /> */}
            <div className="mt-8 mb-16">
            </div>
          </div>
        </div>
        <div>
          <UserApps />
        </div>
      </main>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePageContent />
    </QueryClientProvider>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap justify-center gap-2 px-2">
        <ExampleButton
          text="Habit Tracker"
          promptText="Build a tool to track my daily habits and progress."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Sales Dashboard"
          promptText="Create an internal dashboard for my sales team to track leads and deals."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Book Club Website"
          promptText="Build a website for my local book club with a forum and event calendar."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
      </div>
    </div>
  );
}
