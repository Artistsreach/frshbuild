import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserApps } from "@/actions/user-apps";
import { getPublicApps } from "@/actions/public-apps";
import { isLoggedIn } from "@/actions/is-logged-in";
import { AppCard } from "./app-card";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";

export function UserApps() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"user" | "public">("user");

  const { data: loggedIn } = useQuery({
    queryKey: ["auth", "loggedIn"],
    queryFn: isLoggedIn,
    initialData: false,
  });

  const { data: userApps } = useQuery({
    queryKey: ["userApps"],
    queryFn: getUserApps,
    initialData: [],
    enabled: true, // still works for logged-out (returns public), but we will use explicit public list below
  });

  const { data: publicApps } = useQuery({
    queryKey: ["publicApps"],
    queryFn: getPublicApps,
    initialData: [],
  });

  const onAppDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["userApps"] });
  };

  const items = useMemo(() => {
    if (!loggedIn) return publicApps ?? [];
    return view === "public" ? publicApps ?? [] : userApps ?? [];
  }, [loggedIn, view, publicApps, userApps]);

  return (
    <div className="px-4 sm:px-8 flex-grow">
      {loggedIn && (
        <div className="flex items-center justify-center mb-4">
          <Button
            size="sm"
            variant={view === "user" ? "default" : "outline"}
            onClick={() => setView("user")}
            className="rounded-r-none"
          >
            Your Apps
          </Button>
          <Button
            size="sm"
            variant={view === "public" ? "default" : "outline"}
            onClick={() => setView("public")}
            className="rounded-l-none"
          >
            Community
          </Button>
        </div>
      )}
      <div className="bg-zinc-100 dark:bg-[#141414] rounded-t-2xl p-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-[-15px]">
          {items.map((app: any) => (
            <AppCard
              key={app.id}
            id={app.id}
            name={app.name}
            createdAt={app.createdAt}
            deletable={app.deletable}
            public={app.is_public}
            onDelete={onAppDeleted}
            stripeProductId={app.stripeProductId}
            source={view === "user" ? "user" : "community"}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
