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
import { updateAppName } from "@/actions/update-app-name";

export function EditAppNameModal({
  appName,
  appId,
  onSuccess,
  children,
  open,
  onOpenChange,
}: {
  appName: string;
  appId: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [name, setName] = useState(appName);

  const handleSubmit = async () => {
    await updateAppName(appId, name);
    toast.success("App name updated successfully");
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit App Name</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex flex-col gap-2 mb-4">
            <Label>App Name</Label>
            <Input
              placeholder="App Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
