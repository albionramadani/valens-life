import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import ShopDetails from "@v/components/inner-shop/shop-details";

export const Route = createFileRoute("/shop-details")({
  head: () => ({ meta: [{ title: "Shop Details - Valens" }] }),
  component: () => (
    <Wrapper>
      <ShopDetails />
    </Wrapper>
  ),
});
