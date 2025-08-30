"use client";

import { Button } from "./ui/button";
import { ExternalLink, Github, Settings } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  appName: string;
  appId: string;
  repoId: string;
  domain?: string;
  showRecreate?: boolean;
  sourceAppId?: string;
  isPublic?: boolean;
  isOwner?: boolean;
  isRecreatable?: boolean;
  isCrowdfunded?: boolean;
  stripeProductId?: string;
  requiresSubscription?: boolean;
  isSubscriber?: boolean;
  actions?: React.ReactNode;
}

export function TopBar(props: TopBarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold">{props.appName}</h1>
        {props.domain && (
          <Link
            href={`https://${props.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Live</span>
          </Link>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {props.actions}
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`https://github.com/${props.repoId}`} target="_blank">
            <Github className="h-4 w-4 mr-2" />
            Code
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/app/${props.appId}/settings`}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
