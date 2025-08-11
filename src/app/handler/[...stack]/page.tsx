import { stackServerApp } from "@/auth/stack-auth";
import { StackHandler } from "@stackframe/stack";
import StripeDashboardTab from "@/components/stripe-dashboard-tab";

export default function Handler(props: unknown) {
  return (
    <StackHandler
      fullPage
      app={stackServerApp}
      routeProps={props}
      componentProps={{
        AccountSettings: {
          extraItems: [
            {
              id: "stripe-dashboard",
              title: "Stripe Dashboard",
              iconName: "CreditCard",
              content: <StripeDashboardTab />,
            },
          ],
        },
      }}
    />
  );
}
