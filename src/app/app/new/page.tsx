import { createApp } from "@/actions/create-app";
import { redirect } from "next/navigation";
import { getUser } from "@/auth/get-user";

// Force dynamic rendering to avoid static generation issues with cookies
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This page is never rendered. It is used to:
// - Force user login without losing the user's initial message and template selection.
// - Force a loading page to be rendered (loading.tsx) while the app is being created.
export default async function NewAppRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
  params: Promise<{ id: string }>;
}) {
  const search = await searchParams;
  
  try {
    const user = await getUser();
    console.log("User authentication check:", { user: user ? { uid: user.uid } : null });
    
    if (!user) {
      // Redirect back to home page with the prompt and a sign-in message
      const redirectUrl = `/?message=${encodeURIComponent(search.message as string || "")}&template=${search.template || "nextjs"}&signin=true`;
      console.log("Redirecting to home with sign-in prompt:", redirectUrl);
      redirect(redirectUrl);
    }

    // Extract message safely; do not double-decode here
    const rawMessage = Array.isArray(search.message)
      ? (search.message[0] as string | undefined)
      : (search.message as string | undefined);
    const message = rawMessage ?? undefined;

    console.log("Creating app with:", { message, template: search.template, userId: user.uid });

    const { id } = await createApp({
      initialMessage: message,
      templateId: (search.template as string) || "nextjs",
    });

    console.log("App created successfully, redirecting to:", `/app/${id}`);
    redirect(`/app/${id}`);
  } catch (error: any) {
    console.error("Error in NewAppRedirectPage:", error);
    
    // Don't log NEXT_REDIRECT errors as they are expected
    if (error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw NEXT_REDIRECT errors as they are handled by Next.js
    }
    
    // If there's an error, redirect back to home page
    const redirectUrl = `/?message=${encodeURIComponent(search.message as string || "")}&template=${search.template || "nextjs"}&error=true`;
    redirect(redirectUrl);
  }
}
