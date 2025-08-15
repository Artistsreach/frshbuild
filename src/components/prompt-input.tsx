import { useRef } from "react";
import { PromptInputTextarea } from "./ui/prompt-input";
import { useTypingAnimation } from "../hooks/typing-animation";

export function PromptInputTextareaWithTypingAnimation({
  id,
  name,
  autoComplete,
}: {
  id?: string;
  name?: string;
  autoComplete?: string;
}) {
  const placeholderRef = useRef<HTMLTextAreaElement>(null);

  const exampleIdeas = [
    "a tool to track my daily habits",
    "an internal dashboard for my sales team",
    "a website for my local book club",
  ];

  const { displayText } = useTypingAnimation({
    texts: exampleIdeas,
    baseText: "I want to build",
    typingSpeed: 100,
    erasingSpeed: 50,
    pauseDuration: 2000,
    initialDelay: 500,
  });

  return (
    <PromptInputTextarea
      id={id}
      name={name}
      autoComplete={autoComplete}
      ref={placeholderRef}
      placeholder={displayText}
      className="min-h-[100px] w-full bg-transparent dark:bg-transparent backdrop-blur-sm pr-12"
      onBlur={() => {}}
    />
  );
}
