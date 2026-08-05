import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/shop-details")({
  beforeLoad: ({ location }) => {
    // /shop-details without an id — send shoppers back to the catalog.
    if (location.pathname === "/shop-details" || location.pathname === "/shop-details/") {
      throw redirect({ to: "/produktet" });
    }
  },
  component: () => <Outlet />,
});
