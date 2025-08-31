"use client";

import { useRouter } from "next/navigation";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { Banknote, CoinsIcon } from "lucide-react";
import Stars from "@/components/ui/stars";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseFunctions } from "@/lib/firebaseFunctions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

import { ModeToggle } from "@/components/theme-toggle";
import { UserApps } from "@/components/user-apps";
import LoginButton from "@/components/LoginButton";

const queryClient = new QueryClient();

function HomePageContent() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const submittedRef = useRef(false);
  const { user } = useAuth();

  const handleSubmit = useCallback(async (overridePrompt?: string) => {
    if (submittedRef.current) return;
    const usedPrompt = (overridePrompt ?? prompt) || "";
    if (!usedPrompt.trim()) return;
    
    // Check if user is authenticated
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    
    submittedRef.current = true;
    setIsLoading(true);

    // Only redirect to app creation if user is authenticated
    router.push(
      `/app/new?message=${encodeURIComponent(usedPrompt)}&template=${framework}`
    );
  }, [prompt, framework, router, user]);

  useEffect(() => {
    // 1) Tell parent we're ready
    try {
      window.parent?.postMessage({ type: "FF_READY" }, "*");
    } catch {}

    const applyPrompt = (p: string, shouldAutoBuild: boolean) => {
      if (!p) return;
      setPrompt(p);
      // Wait for React state -> button disabled prop to update
      setTimeout(() => {
        if (shouldAutoBuild && !submittedRef.current) handleSubmit(p);
      }, 0);
    };

    // 2) Read from URL and hash on initial load
    try {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const urlPrompt = search.get("prompt") || hash.get("prompt") || search.get("message");
      const autobuild = search.get("autobuild") || hash.get("autobuild");
      const signinPrompt = search.get("signin");
      const errorState = search.get("error");
      
      if (urlPrompt) {
        applyPrompt(urlPrompt, autobuild === "1" || autobuild === "true");
      }
      
      if (signinPrompt === "true") {
        setShowSignInPrompt(true);
      }
      
      if (errorState === "true") {
        setShowError(true);
      }
    } catch {}

    // 3) Accept postMessage from parent
    const onMessage = (e: MessageEvent) => {
      // Optional: restrict to your desktop origin
      // if (e.origin !== "http://localhost:5173") return;
      const data = e.data as any;
      if (data?.type === "FF_BUILD_APP" && typeof data.prompt === "string") {
        applyPrompt(data.prompt, true);
        try { window.parent?.postMessage({ type: "FF_ACK", received: true }, "*"); } catch {}
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setPrompt, handleSubmit]);

  // Fetch credits
  useEffect(() => {
    if (!user) {
      setCredits(0);
      setCreditsLoading(false);
      return;
    }

    const getCredits = async () => {
      try {
        setCreditsLoading(true);
        const userCredits = await firebaseFunctions.getUserCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error('Error getting credits:', error);
        setCredits(0);
      } finally {
        setCreditsLoading(false);
      }
    };

    getCredits();
    
    // Set up polling for real-time updates
    const interval = setInterval(async () => {
      try {
        const userCredits = await firebaseFunctions.getUserCredits();
        setCredits(userCredits);
      } catch (error) {
        console.error('Error updating credits:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

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
          {user && (
            <div 
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Firebase credits"
            >
              <CoinsIcon className="h-4 w-4 dark:text-yellow-400" />
              <span className="font-bold">
                {creditsLoading ? "..." : credits.toLocaleString()}
              </span>
            </div>
          )}
          <ModeToggle />
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startFunding}
                disabled={fundingLoading}
                className="flex items-center gap-2"
              >
                <Banknote className="h-4 w-4" />
                {fundingLoading ? "Opening…" : "Get Funded"}
              </Button>
            )}
            <LoginButton />
          </div>
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

          {/* Sign-in prompt alert */}
          {showSignInPrompt && (
            <Alert className="mb-4 w-full max-w-lg">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please sign in to continue building your app. Your prompt has been saved.
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert */}
          {showError && (
            <Alert className="mb-4 w-full max-w-lg" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There was an error creating your app. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full relative my-5">
            <div className="relative w-full max-w-full overflow-hidden">
              <div className="w-full bg-accent rounded-3xl relative z-10 border transition-colors shimmer-border">
                <PromptInput
                  isLoading={isLoading}
                  value={prompt}
                  onValueChange={setPrompt}
                  onSubmit={() => handleSubmit()}
                  className="relative z-10 border-none bg-transparent shadow-none transition-all duration-200 ease-in-out "
                >
                  <div id="home-prompt-field">
                    <PromptInputTextareaWithTypingAnimation
                      id="home-prompt-input"
                      name="app_description"
                      autoComplete="on"
                      data-ff-role="prompt"
                    />
                  </div>
                  <PromptInputActions>
                    <div id="home-build-button">
                      <Button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isLoading || submittedRef.current || !prompt.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2 text-sm font-semibold"
                        data-ff-role="build"
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
