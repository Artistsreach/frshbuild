"use client";

import { FirebaseCreditsDisplay } from "./firebase-credits-display";

export default function FirebaseCreditsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Credits from Other Project</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View your credits from your other Firebase project when you sign in with Google.
        </p>
      </div>
      
      <div className="flex justify-start">
        <FirebaseCreditsDisplay />
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">How it works</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Link your Google account in the authentication settings</li>
          <li>• We'll fetch your credits from the other Firebase project</li>
          <li>• Credits are displayed here and refreshed automatically</li>
          <li>• Your credits are read-only and synced with the other project</li>
        </ul>
      </div>
    </div>
  );
}
