"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { DeploymentStatus } from "./deployment-status";
import { Deployment } from "@/db/schema";
import { RefreshCw, PackageOpen, Loader2 } from "lucide-react";

type DeploymentWithApp = Deployment & {
  app: {
    id: string;
    name: string;
  };
};

interface DeploymentHistoryProps {
  appId: string;
  initialDeployments?: DeploymentWithApp[];
  showAppName?: boolean;
  limit?: number;
  className?: string;
}

export function DeploymentHistory({
  appId,
  initialDeployments = [],
  showAppName = false,
  limit = 10,
  className,
}: DeploymentHistoryProps) {
  const router = useRouter();
  const [deployments, setDeployments] = useState<DeploymentWithApp[]>(initialDeployments);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeployments = async () => {
    try {
      const response = await fetch(`/api/apps/${appId}/deployments?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }
      const data = await response.json();
      setDeployments(data);
      return data;
    } catch (error) {
      console.error("Error fetching deployments:", error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDeployments();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialDeployments.length) {
      setIsLoading(true);
      fetchDeployments().finally(() => setIsLoading(false));
    }
  }, [appId]);

  const filteredDeployments = deployments.filter((deployment) => {
    if (activeTab === "all") return true;
    if (activeTab === "builds") return deployment.type === "build";
    if (activeTab === "submissions") return deployment.type === "submit";
    return true;
  });

  const hasDeployments = filteredDeployments.length > 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Deployment History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing || isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="builds">Builds</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : hasDeployments ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredDeployments.map((deployment) => (
                  <DeploymentStatus
                    key={deployment.id}
                    deployment={deployment}
                    showAppName={showAppName}
                    onRefresh={fetchDeployments}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No deployments found</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === "all"
                  ? "This app doesn't have any deployments yet."
                  : `No ${activeTab} found.`}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
