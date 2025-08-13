"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, Smartphone, UploadCloud, CheckCircle2, XCircle } from "lucide-react";

type BuildStatus = {
  id: string;
  platform: 'android' | 'ios';
  status: 'in-queue' | 'in-progress' | 'finished' | 'error';
  logs?: string;
  buildUrl?: string;
};

type DeployTarget = 'development' | 'preview' | 'production' | 'submit';

type ExpoDeployModalProps = {
  appId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExpoDeployModal({ appId, open, onOpenChange }: ExpoDeployModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<DeployTarget>('development');
  const [platforms, setPlatforms] = useState<('android' | 'ios')[]>(['android']);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<'idle' | 'building' | 'submitting' | 'complete' | 'error'>('idle');
  const [builds, setBuilds] = useState<BuildStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startDeployment = async () => {
    if (!platforms.length) {
      setError('Please select at least one platform');
      return;
    }

    setIsDeploying(true);
    setDeployStep('building');
    setError(null);
    
    // Initialize builds state
    const initialBuilds = platforms.map(platform => ({
      id: `${platform}-${Date.now()}`,
      platform,
      status: 'in-queue' as const,
    }));
    setBuilds(initialBuilds);

    try {
      // Start builds for each platform
      for (const build of initialBuilds) {
        try {
          // Update build status to in-progress
          updateBuildStatus(build.id, 'in-progress');
          
          // Call API to start the build
          const response = await fetch(`/api/apps/${appId}/expo/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: build.platform,
              target: selectedTarget,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to start ${build.platform} build`);
          }

          const { buildId, buildUrl } = await response.json();
          
          // Update build with URL and mark as finished
          updateBuildStatus(build.id, 'finished', buildUrl);
          
          // If this is a production build and we're submitting to stores
          if (selectedTarget === 'submit') {
            setDeployStep('submitting');
            await submitToStore(appId, build.platform, buildId);
          }
          
        } catch (err) {
          console.error(`Build failed for ${build.platform}:`, err);
          updateBuildStatus(build.id, 'error', undefined, err instanceof Error ? err.message : 'Build failed');
          setError(`Failed to build for ${build.platform}`);
        }
      }
      
      setDeployStep('complete');
    } catch (err) {
      console.error('Deployment failed:', err);
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setDeployStep('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const updateBuildStatus = (id: string, status: BuildStatus['status'], buildUrl?: string, errorMessage?: string) => {
    setBuilds(prev => 
      prev.map(build => 
        build.id === id 
          ? { ...build, status, buildUrl, logs: errorMessage || build.logs } 
          : build
      )
    );
  };

  const submitToStore = async (appId: string, platform: 'android' | 'ios', buildId: string) => {
    try {
      const response = await fetch(`/api/apps/${appId}/expo/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, buildId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit ${platform} build to store`);
      }

      return await response.json();
    } catch (err) {
      console.error(`Failed to submit ${platform} build:`, err);
      throw err;
    }
  };

  const togglePlatform = (platform: 'android' | 'ios') => {
    setPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getBuildStatusIcon = (status: BuildStatus['status']) => {
    switch (status) {
      case 'in-queue':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'finished':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Deploy to Expo</DialogTitle>
          <DialogDescription>
            Build and deploy your Expo app to development, preview, or production environments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Deployment Target</h3>
            <Tabs 
              defaultValue={selectedTarget}
              onValueChange={(value) => setSelectedTarget(value as DeployTarget)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="development">Development</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="production">Production</TabsTrigger>
                <TabsTrigger value="submit">Submit to Store</TabsTrigger>
              </TabsList>
              
              <TabsContent value="development" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Create a development build for testing with Expo Go or a development client.
                </p>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Create a preview build for internal testing and QA.
                </p>
              </TabsContent>
              
              <TabsContent value="production" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Create a production build for app store submission.
                </p>
              </TabsContent>
              
              <TabsContent value="submit" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Submit your app to the Apple App Store and Google Play Store.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Platforms</h3>
            <div className="flex space-x-4">
              <Button
                variant={platforms.includes('android') ? 'default' : 'outline'}
                onClick={() => togglePlatform('android')}
                disabled={isDeploying}
                className="flex-1"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Android
              </Button>
              <Button
                variant={platforms.includes('ios') ? 'default' : 'outline'}
                onClick={() => togglePlatform('ios')}
                disabled={isDeploying}
                className="flex-1"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                iOS
              </Button>
            </div>
          </div>

          {builds.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Build Status</h3>
              <div className="space-y-2">
                {builds.map((build) => (
                  <div 
                    key={build.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      {getBuildStatusIcon(build.status)}
                      <span className="font-medium capitalize">{build.platform}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {build.status === 'in-queue' && 'Queued...'}
                      {build.status === 'in-progress' && 'Building...'}
                      {build.status === 'finished' && (
                        <a 
                          href={build.buildUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Build
                        </a>
                      )}
                      {build.status === 'error' && (
                        <span className="text-red-500">Failed: {build.logs}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            Cancel
          </Button>
          <Button 
            onClick={startDeployment}
            disabled={isDeploying || platforms.length === 0}
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {deployStep === 'building' && 'Building...'}
                {deployStep === 'submitting' && 'Submitting...'}
                {deployStep === 'complete' ? 'Deployed!' : 'Deploying...'}
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Start Deployment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExpoDeployModal;
