"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { getAppStats } from "@/actions/get-app-stats";

type StatsModalProps = {
  appName: string;
  appId: string;
};

export function StatsModal({ appName, appId }: StatsModalProps) {
  const [stats, setStats] = useState<{ users: number; revenue: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getAppStats(appId)
        .then(setStats)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [appId, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appName} Stats</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {stats && (
            <>
              <p>Users: {stats.users}</p>
              <p>Recurring Revenue: ${stats.revenue}/mo</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
