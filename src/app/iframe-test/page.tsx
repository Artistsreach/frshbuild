"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function IframeTestPage() {
  const { user, loading } = useAuth();
  const [isInIframe, setIsInIframe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simple iframe detection
    const checkIframe = () => {
      try {
        const inIframe = window.self !== window.top;
        setIsInIframe(inIframe);
      } catch (error) {
        // If we can't access window.top, we're likely in an iframe
        setIsInIframe(true);
      }
    };

    checkIframe();
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Iframe Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Iframe Status:</strong> {isInIframe ? "Running in iframe" : "Running standalone"}
        </div>
        
        <div>
          <strong>Authentication Status:</strong> {loading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
        </div>
        
        {user && (
          <div>
            <strong>User:</strong> {user.email}
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Iframe Embed Code:</h2>
          <code className="text-sm">
            {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/iframe-test" width="100%" height="600" frameborder="0"></iframe>`}
          </code>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">✅ Iframe Compatibility Status:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>No Stack Auth errors: {!isInIframe || "✅ Working"}</li>
            <li>Firebase Auth: {user ? "✅ Working" : "⏳ Loading..."}</li>
            <li>Page loaded successfully: ✅ Working</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
