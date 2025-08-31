import { FreestyleSandboxes } from "freestyle-sandboxes";

const apiKey = process.env.FREESTYLE_API_KEY;

// Debug logging (remove in production)
if (!apiKey) {
  console.error("❌ FREESTYLE_API_KEY is not set!");
} else if (apiKey.length < 10) {
  console.error("❌ FREESTYLE_API_KEY appears to be too short:", apiKey.length, "characters");
} else {
  console.log("✅ FREESTYLE_API_KEY is set, length:", apiKey.length);
}

export const freestyle = new FreestyleSandboxes({
  apiKey: apiKey!,
});
