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
import { 
  Loader2, 
  Smartphone, 
  Store, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

type DeploymentStatus = {
  id: string;
  platform: 'android' | 'ios';
  buildStatus: 'queued' | 'in-progress' | 'completed' | 'failed';
  submitStatus: 'pending' | 'in-progress' | 'completed' | 'failed' | 'not-started';
  buildUrl?: string;
  submissionId?: string;
  logs?: string;
  progress: number;
};

type AppStoreDeployModalProps = {
  appId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName?: string;
};

export function AppStoreDeployModal({ 
  appId, 
  open, 
  onOpenChange, 
  appName = "Your App" 
}: AppStoreDeployModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<('android' | 'ios')[]>(['ios']);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<'idle' | 'building' | 'submitting' | 'complete' | 'error'>('idle');
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setDeployStep('idle');
      setDeployments([]);
      setError(null);
      setOverallProgress(0);
    }
  }, [open]);

  const startAppStoreDeployment = async () => {
    if (!selectedPlatforms.length) {
      setError('Please select at least one platform');
      return;
    }

    setIsDeploying(true);
    setDeployStep('building');
    setError(null);
    
    // Initialize deployment status
    const initialDeployments = selectedPlatforms.map(platform => ({
      id: `${platform}-${Date.now()}`,
      platform,
      buildStatus: 'queued' as const,
      submitStatus: 'not-started' as const,
      progress: 0,
    }));
    setDeployments(initialDeployments);

    try {
      // Step 1: Build for production
      for (const deployment of initialDeployments) {
        try {
          updateDeploymentStatus(deployment.id, { buildStatus: 'in-progress', progress: 10 });
          
          const buildResponse = await fetch(`/api/apps/${appId}/expo/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: deployment.platform,
              target: 'production',
              message: `App Store build for ${deployment.platform}`,
            }),
          });

          if (!buildResponse.ok) {
            const errorData = await buildResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to start ${deployment.platform} build`);
          }

          const { buildId, buildUrl } = await buildResponse.json();
          updateDeploymentStatus(deployment.id, { 
            buildStatus: 'completed', 
            buildUrl, 
            progress: 50 
          });

          // Step 2: Submit to App Store
          setDeployStep('submitting');
          updateDeploymentStatus(deployment.id, { 
            submitStatus: 'in-progress', 
            progress: 75 
          });

          const submitResponse = await fetch(`/api/apps/${appId}/expo/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: deployment.platform,
              buildId,
              track: 'production',
            }),
          });

          if (!submitResponse.ok) {
            const errorData = await submitResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to submit ${deployment.platform} to store`);
          }

          const { submissionId } = await submitResponse.json();
          updateDeploymentStatus(deployment.id, { 
            submitStatus: 'completed', 
            submissionId,
            progress: 100 
          });

        } catch (err) {
          console.error(`Deployment failed for ${deployment.platform}:`, err);
          updateDeploymentStatus(deployment.id, { 
            buildStatus: 'failed',
            submitStatus: 'failed',
            logs: err instanceof Error ? err.message : 'Deployment failed',
            progress: 0
          });
          setError(`Failed to deploy to ${deployment.platform}`);
        }
      }
      
      setDeployStep('complete');
      updateOverallProgress();
      toast.success(`${appName} has been submitted to the App Store!`);
      
    } catch (err) {
      console.error('App Store deployment failed:', err);
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setDeployStep('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const updateDeploymentStatus = (id: string, updates: Partial<DeploymentStatus>) => {
    setDeployments(prev => 
      prev.map(deployment => 
        deployment.id === id 
          ? { ...deployment, ...updates } 
          : deployment
      )
    );
  };

  const updateOverallProgress = () => {
    const totalProgress = deployments.reduce((sum, d) => sum + d.progress, 0);
    setOverallProgress(deployments.length > 0 ? totalProgress / deployments.length : 0);
  };

  const togglePlatform = (platform: 'android' | 'ios') => {
    if (isDeploying) return;
    
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getStatusIcon = (buildStatus: DeploymentStatus['buildStatus'], submitStatus: DeploymentStatus['submitStatus']) => {
    if (buildStatus === 'failed' || submitStatus === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (buildStatus === 'completed' && submitStatus === 'completed') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (buildStatus === 'in-progress' || submitStatus === 'in-progress') {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (deployment: DeploymentStatus) => {
    if (deployment.buildStatus === 'failed' || deployment.submitStatus === 'failed') {
      return 'Failed';
    }
    if (deployment.submitStatus === 'completed') {
      return 'Submitted to Store';
    }
    if (deployment.submitStatus === 'in-progress') {
      return 'Submitting to Store...';
    }
    if (deployment.buildStatus === 'completed') {
      return 'Build Complete';
    }
    if (deployment.buildStatus === 'in-progress') {
      return 'Building...';
    }
    if (deployment.buildStatus === 'queued') {
      return 'Queued';
    }
    return 'Ready';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Publish to App Store
          </DialogTitle>
          <DialogDescription>
            Build and submit {appName} to the Apple App Store and Google Play Store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Platforms</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedPlatforms.includes('ios') ? 'default' : 'outline'}
                onClick={() => togglePlatform('ios')}
                disabled={isDeploying}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Smartphone className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">iOS</div>
                  <div className="text-xs text-muted-foreground">Apple App Store</div>
                </div>
              </Button>
              <Button
                variant={selectedPlatforms.includes('android') ? 'default' : 'outline'}
                onClick={() => togglePlatform('android')}
                disabled={isDeploying}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Smartphone className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Android</div>
                  <div className="text-xs text-muted-foreground">Google Play Store</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          {isDeploying && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Deployment Status */}
          {deployments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Deployment Status</h3>
              {deployments.map((deployment) => (
                <div 
                  key={deployment.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deployment.buildStatus, deployment.submitStatus)}
                    <div>
                      <div className="font-medium capitalize flex items-center gap-2">
                        {deployment.platform}
                        {deployment.submitStatus === 'completed' && (
                          <Badge variant="secondary" className="text-xs">
                            Submitted
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(deployment)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deployment.buildUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={deployment.buildUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Build
                        </a>
                      </Button>
                    )}
                    {deployment.progress > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {deployment.progress}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {deployStep === 'complete' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
              <div className="flex items-center gap-2 font-medium mb-2">
                <CheckCircle2 className="h-4 w-4" />
                Submission Complete!
              </div>
              <p className="text-sm">
                Your app has been submitted to the selected app stores. 
                Review and approval typically takes 1-7 days.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            {deployStep === 'complete' ? 'Close' : 'Cancel'}
          </Button>
          {deployStep !== 'complete' && (
            <Button 
              onClick={startAppStoreDeployment}
              disabled={isDeploying || selectedPlatforms.length === 0}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {deployStep === 'building' && 'Building...'}
                  {deployStep === 'submitting' && 'Submitting...'}
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Publish to App Store
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AppStoreDeployModal;
