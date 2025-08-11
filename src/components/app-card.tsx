"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Trash, ExternalLink, MoreVertical, Globe, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { CrowdfundModal } from "./crowdfund-modal";
import { EditAppNameModal } from "./edit-app-name-modal";
import { StatsModal } from "./stats-modal";
import { TierSelectionModal } from "./tier-selection-modal";

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
  deletable?: boolean;
  public?: boolean;
  stripeProductId?: string;
  source: "user" | "community";
};

export function AppCard({
  id,
  name,
  createdAt,
  onDelete,
  deletable = true,
  public: isPublic,
  stripeProductId,
  source,
}: AppCardProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteApp(id);
    toast.success("App deleted successfully");
    if (onDelete) {
      onDelete();
    }

    console.log(`Delete app: ${id}`);
  };

  function getEmojiForApp(appName: string): string {
    const n = appName.toLowerCase();
    if (/(chat|message|dm|sms)/.test(n)) return "💬";
    if (/(shop|store|commerce|e-?commerce|cart)/.test(n)) return "🛍️";
    if (/(blog|write|journal|note)/.test(n)) return "📝";
    if (/(news|article|press)/.test(n)) return "📰";
    if (/(game|play|arcade)/.test(n)) return "🎮";
    if (/(task|todo|to-do|kanban)/.test(n)) return "✅";
    if (/(calendar|event|schedule)/.test(n)) return "📆";
    if (/(photo|image|gallery|camera)/.test(n)) return "📷";
    if (/(music|audio|podcast|song|playlist)/.test(n)) return "🎵";
    if (/(video|stream|tube)/.test(n)) return "📺";
    if (/(recipe|cook|food|meal|restaurant)/.test(n)) return "🍽️";
    if (/(fitness|workout|gym|health|wellness)/.test(n)) return "💪";
    if (/(finance|budget|expense|money|invoice|bank|crypto)/.test(n)) return "💰";
    if (/(weather|forecast)/.test(n)) return "☀️";
    if (/(education|learn|course|school|study)/.test(n)) return "🎓";
    if (/(travel|trip|flight|hotel|map)/.test(n)) return "✈️";
    if (/(social|community|friends|group)/.test(n)) return "👥";
    if (/(ai|agent|bot)/.test(n)) return "🤖";
    if (/(code|dev|developer|project)/.test(n)) return "💻";
    if (/(dashboard|analytics|report)/.test(n)) return "📊";
    if (/(portfolio|gallery|work)/.test(n)) return "🗂️";
    return "✨";
  }

  return (
    <Card className="p-3 sm:p-4 border-b border rounded-xl h-32 sm:h-36 relative w-full">
      <Link href={`/app/${id}`} className="cursor-pointer block">
        <CardHeader className="p-0">
          <CardTitle className="text-sm sm:text-base truncate flex items-center gap-1">
            {name}
            {deletable && isPublic ? (
              <span className="inline-flex items-center gap-1 text-blue-500">
                <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="sr-only">Public</span>
              </span>
            ) : null}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Created {createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Link>

      {/* Bottom-left emoji badge */}
      <div className="absolute bottom-2 left-2 text-lg select-none">
        <span aria-hidden>{getEmojiForApp(name)}</span>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {deletable && !stripeProductId && (
          <CrowdfundModal appName={name} appId={id} onSuccess={onDelete} />
        )}
        {stripeProductId && isPublic && source === "community" && (
          <Button size="sm" onClick={() => setIsTierModalOpen(true)}>
            Subscribe
          </Button>
        )}
        {source === "user" && stripeProductId && deletable && (
          <StatsModal appName={name} appId={id} />
        )}
      </div>

      {stripeProductId && (
        <TierSelectionModal
          appName={name}
          productId={stripeProductId}
          open={isTierModalOpen}
          onOpenChange={setIsTierModalOpen}
        />
      )}

      {deletable && (
        <div className="absolute top-2 right-2 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditModalOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpen}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <EditAppNameModal
        appName={name}
        appId={id}
        onSuccess={() => {
          onDelete?.();
          setIsEditModalOpen(false);
        }}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </Card>
  );
}
