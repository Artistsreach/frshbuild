"use client";

import { useEffect } from "react";

export default function IframeTestPage() {
  useEffect(() => {
    // Notify parent window that the iframe is ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'FF_READY', message: 'FreshChef iframe is ready' }, '*');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            FreshChef Iframe Test
          </h1>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Iframe Test Successful
              </h2>
              <p className="text-green-700">
                If you can see this page, FreshChef is successfully embedded in an iframe!
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Test Information
              </h2>
              <ul className="text-blue-700 space-y-1">
                <li>• No "useStackApp must be used within a StackProvider" errors</li>
                <li>• Firebase authentication should work</li>
                <li>• App should load and function normally</li>
                <li>• Cross-origin communication is working</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Embed Code Example
              </h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`<iframe 
  src="https://your-domain.com/iframe-test" 
  width="100%" 
  height="600" 
  frameborder="0"
  allow="camera; microphone; geolocation; encrypted-media">
</iframe>`}
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Troubleshooting
              </h2>
              <ul className="text-yellow-700 space-y-1">
                <li>• Check browser console for any errors</li>
                <li>• Ensure the parent domain is allowed in CSP headers</li>
                <li>• Verify that X-Frame-Options is set to ALLOWALL</li>
                <li>• Check if Content-Security-Policy allows frame-ancestors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
