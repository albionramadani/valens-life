import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import Cart from "@v/components/inner-shop/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart - Valens" }] }),
  component: () => (
    <Wrapper>
      <Cart />
    </Wrapper>
  ),
});
