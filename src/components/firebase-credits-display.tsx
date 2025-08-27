"use client";

import { useFirebaseCredits } from "@/hooks/use-firebase-credits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Coins, AlertCircle, Link2 } from "lucide-react";
import { useUser } from "@stackframe/stack";

export function FirebaseCreditsDisplay() {
  const { credits, loading, error, refetch, hasGoogleAccount } = useFirebaseCredits();
  const user = useUser();

  if (!user) {
    return null;
  }

  // Check if user has Google OAuth linked
  const hasGoogleOAuth = user.oAuthAccounts?.some(account => account.providerId === "google");

  if (!hasGoogleOAuth) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Link2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">Link Google Account</CardTitle>
          <CardDescription>
            Connect your Google account to access your credits from your other project
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => {
              // Redirect to Stack Auth account settings to link Google
              window.location.href = "/handler/account-settings";
            }}
            className="w-full"
          >
            Link Google Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading credits...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-lg text-red-800">Error Loading Credits</CardTitle>
          <CardDescription className="text-red-600">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={refetch} 
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasGoogleAccount || !credits) {
    return (
      <Card className="w-full max-w-md border-yellow-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-lg text-yellow-800">No Credits Found</CardTitle>
          <CardDescription className="text-yellow-600">
            We couldn't find any credits associated with your Google account in the other project
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Google Account: {credits?.userEmail || "Unknown"}
          </p>
          <Button 
            onClick={refetch} 
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-green-200">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <Coins className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-lg text-green-800">Your Credits</CardTitle>
        <CardDescription>
          From your other project via Google account
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-3xl font-bold text-green-600">
          {credits.credits.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Google Account: {credits.userEmail}</p>
          {credits.googleUserId && (
            <p className="text-xs">ID: {credits.googleUserId.slice(0, 8)}...</p>
          )}
        </div>
        <Button 
          onClick={refetch} 
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Credits
        </Button>
      </CardContent>
    </Card>
  );
}
