"use client";

import Image from "next/image";

import { PromptInputBasic } from "./chatinput";
import { Markdown } from "./ui/markdown";
import { useState } from "react";
import { Button } from "./ui/button";
import { PurchaseModal } from "./purchase-modal";
import { getUserCredits } from "@/actions/get-user-credits";
import { getUser } from "@/actions/get-user";
import { ChatContainer } from "./ui/chat-container";
import { UIMessage } from "ai";
import { ToolMessage } from "./tools";
import { useQuery } from "@tanstack/react-query";
import { chatState } from "@/actions/chat-streaming";
import { CompressedImage } from "@/lib/image-compression";
import { useChatSafe } from "./use-chat";

export default function Chat(props: {
  appId: string;
  initialMessages: UIMessage[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  running: boolean;
  isOwner: boolean;
}) {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const { data: credits } = useQuery({
    queryKey: ["credits"],
    queryFn: () => getUserCredits(),
    refetchInterval: 5000,
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

  const { data: chat } = useQuery({
    queryKey: ["stream", props.appId],
    queryFn: async () => {
      return chatState(props.appId);
    },
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
  });

  const { messages, sendMessage, setMessages } = useChatSafe({
    messages: props.initialMessages,
    id: props.appId,
    resume: props.running && chat?.state === "running",
  });

  const [input, setInput] = useState("");

  const onSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (credits !== undefined && credits < 15) {
      setMessages([
        ...messages,
        {
          id: `low-credits-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: 'INSUFFICIENT_CREDITS' }]
        }
      ]);
      setInput("");
      return;
    }

    sendMessage(
      {
        parts: [
          {
            type: "text",
            text: input,
          },
        ],
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  const onSubmitWithImages = (text: string, images: CompressedImage[]) => {
    if (credits !== undefined && credits < 15) {
      setMessages([
        ...messages,
        {
          id: `low-credits-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: 'INSUFFICIENT_CREDITS' }]
        }
      ]);
      setInput("");
      return;
    }

    const parts: Parameters<typeof sendMessage>[0]["parts"] = [];

    if (text.trim()) {
      parts.push({
        type: "text",
        text: text,
      });
    }

    images.forEach((image) => {
      parts.push({
        type: "file",
        mediaType: image.mimeType,
        url: image.data,
      });
    });

    sendMessage(
      {
        parts,
      },
      {
        headers: {
          "Adorable-App-Id": props.appId,
        },
      }
    );
    setInput("");
  };

  async function handleStop() {
    await fetch("/api/chat/" + props.appId + "/stream", {
      method: "DELETE",
      headers: {
        "Adorable-App-Id": props.appId,
      },
    });
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ transform: "translateZ(0)" }}
    >
      {props.topBar}
      <div
        className="flex-1 overflow-y-auto flex flex-col space-y-6 min-h-0"
        style={{ overflowAnchor: "auto" }}
      >
        <ChatContainer autoScroll>
          {messages.map((message: any, idx: number) => (
            <MessageBody
              key={message.id ? `${message.id}-${idx}` : `msg-${idx}`}
              message={message}
              onPurchaseClick={() => setPurchaseModalOpen(true)}
            />
          ))}
        </ChatContainer>
      </div>
      <div className="flex-shrink-0 p-3 transition-all bg-background md:backdrop-blur-sm">
        <PurchaseModal
          open={purchaseModalOpen}
          onOpenChange={setPurchaseModalOpen}
          userId={user?.id ?? ""}
        />
        {props.isOwner && !(props.isLoading || chat?.state === "running") ? (
          <div className="flex justify-center">
            <Button
              onClick={() =>
                sendMessage(
                  {
                    parts: [
                      {
                        type: "text",
                        text: "continue",
                      },
                    ],
                  },
                  {
                    headers: {
                      "Adorable-App-Id": props.appId,
                    },
                  }
                )
              }
              className="mb-4"
            >
              Continue
            </Button>
          </div>
        ) : null}
        <PromptInputBasic
          stop={handleStop}
          input={input}
          onValueChange={(value: string) => {
            setInput(value);
          }}
          onSubmit={onSubmit}
          onSubmitWithImages={onSubmitWithImages}
          isGenerating={props.isLoading || chat?.state === "running"}
          disabled={!props.isOwner}
        />
      </div>
    </div>
  );
}

function MessageBody({ message, onPurchaseClick }: { message: any, onPurchaseClick: () => void }) {
  if (message.parts && message.parts[0]?.text === 'INSUFFICIENT_CREDITS') {
    return (
      <div className="mb-4">
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Low Credits!</strong>
          <span className="block sm:inline"> You have less than 15 credits. Please purchase more to continue the conversation.</span>
          <div className="mt-2">
            <Button onClick={onPurchaseClick}>Buy Credits</Button>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1 mb-4">
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-xl px-4 py-1 max-w-[80%] ml-auto">
          {message.parts.map((part: any, index: number) => {
            if (part.type === "text") {
              return <div key={index}>{part.text}</div>;
            } else if (
              part.type === "file" &&
              part.mediaType?.startsWith("image/")
            ) {
              return (
                <div key={index} className="mt-2">
                  <Image
                    src={part.url as string}
                    alt="User uploaded image"
                    width={200}
                    height={200}
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              );
            }
            return <div key={index}>unexpected message</div>;
          })}
        </div>
      </div>
    );
  }

  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part: any, index: any) => {
          if (part.type === "text") {
            return (
              <div key={index} className="mb-4">
                <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                  {part.text}
                </Markdown>
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            // if (
            //   part.toolInvocation.state === "result" &&
            //   part.toolInvocation.result.isError
            // ) {
            //   return (
            //     <div
            //       key={index}
            //       className="border-red-500 border text-sm text-red-800 rounded bg-red-100 px-2 py-1 mt-2 mb-4"
            //     >
            //       {part.toolInvocation.result?.content?.map(
            //         (content: { type: "text"; text: string }, i: number) => (
            //           <div key={i}>{content.text}</div>
            //         )
            //       )}
            //       {/* Unexpectedly failed while using tool{" "}
            //       {part.toolInvocation.toolName}. Please try again. again. */}
            //     </div>
            //   );
            // }

            // if (
            //   message.parts!.length - 1 == index &&
            //   part.toolInvocation.state !== "result"
            // ) {
            return <ToolMessage key={index} toolInvocation={part} />;
            // } else {
            //   return undefined;
            // }
          }
        })}
      </div>
    );
  }

  if (message.parts) {
    return (
      <Markdown className="prose prose-sm dark:prose-invert max-w-none">
        {message.parts
          .map((part: any) =>
            part.type === "text" ? part.text : "[something went wrong]"
          )
          .join("")}
      </Markdown>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
}
