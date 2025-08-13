"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { createSupabaseProject } from "@/actions/create-supabase-project";

export function SupabaseModal({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [projectName, setProjectName] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [region, setRegion] = useState("us-east-1");

  const handleSubmit = async () => {
    try {
      await createSupabaseProject({
        accessToken,
        organizationSlug: orgSlug,
        projectName,
        dbPassword,
        region,
      });
      toast.success("Supabase project created successfully");
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Supabase Project</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <Label>Personal Access Token</Label>
              <Input
                placeholder="sbp_..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            <div>
              <Label>Organization Slug</Label>
              <Input
                placeholder="my-org"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
              />
            </div>
            <div>
              <Label>Project Name</Label>
              <Input
                placeholder="My Supabase Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <Label>Database Password</Label>
              <Input
                type="password"
                placeholder="A strong password"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Region</Label>
              <Input
                placeholder="us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
