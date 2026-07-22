import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import Shop from "@v/components/inner-shop/shop";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop - Valens" }] }),
  component: () => (
    <Wrapper>
      <Shop />
    </Wrapper>
  ),
});
