"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Deployment } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type DeploymentWithApp = Deployment & {
  app: {
    id: string;
    name: string;
  };
};

interface DeploymentStatusProps {
  deployment: DeploymentWithApp;
  className?: string;
  showAppName?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function DeploymentStatus({
  deployment,
  className,
  showAppName = false,
  onRefresh,
}: DeploymentStatusProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPolling, setIsPolling] = useState(
    deployment.status === 'queued' || deployment.status === 'in_progress'
  );

  // Poll for updates if the deployment is in progress
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      // Refresh the deployment status
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isPolling, onRefresh, router]);

  // Stop polling if the deployment is completed or failed
  useEffect(() => {
    if (['completed', 'failed', 'canceled'].includes(deployment.status)) {
      setIsPolling(false);
    }
  }, [deployment.status]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      Promise.resolve(onRefresh()).finally(() => setIsRefreshing(false));
    } else {
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      queued: {
        label: 'Queued',
        variant: 'secondary' as const,
        icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
      },
      in_progress: {
        label: 'In Progress',
        variant: 'default' as const,
        icon: <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />,
      },
      completed: {
        label: 'Completed',
        variant: 'secondary' as const,
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />,
      },
      failed: {
        label: 'Failed',
        variant: 'destructive' as const,
        icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
      },
      canceled: {
        label: 'Canceled',
        variant: 'outline' as const,
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />,
      },
    };

    const status = statusMap[deployment.status];
    return (
      <Badge variant={status.variant} className="flex items-center">
        {status.icon}
        {status.label}
      </Badge>
    );
  };

  const getActionButton = () => {
    if (deployment.status === 'failed') {
      return (
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Retry
        </Button>
      );
    }

    if (deployment.status === 'in_progress' || deployment.status === 'queued') {
      return (
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      );
    }

    if (deployment.buildUrl) {
      return (
        <Button variant="outline" size="sm" asChild>
          <a href={deployment.buildUrl} target="_blank" rel="noopener noreferrer">
            View Build
          </a>
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">
            {showAppName && (
              <span className="font-semibold">{deployment.app.name}</span>
            )}
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="capitalize">
              {deployment.type} {deployment.platform}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            {formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}
            {deployment.completedAt && (
              <>
                <span className="mx-2">•</span>
                Completed {formatDistanceToNow(new Date(deployment.completedAt), { addSuffix: true })}
              </>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {getActionButton()}
        </div>
      </CardHeader>
      <CardContent>
        {deployment.logs && deployment.status === 'failed' && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm font-mono text-red-600 dark:text-red-400 overflow-x-auto">
            {deployment.logs.split('\n').map((line, i) => (
              <div key={i} className="whitespace-pre">{line}</div>
            ))}
          </div>
        )}
        {Boolean(deployment.metadata) && Object.keys(deployment.metadata as Record<string, unknown>).length > 0 ? (
          <div className="mt-3 text-xs text-muted-foreground">
            <div className="font-medium mb-1">Details:</div>
            <pre className="bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(deployment.metadata as Record<string, unknown>, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
