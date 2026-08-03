import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import ProductsPage from "@v/components/inner-page/products";

export const Route = createFileRoute("/produktet")({
  head: () => ({ meta: [{ title: "Produktet - Valens" }] }),
  component: () => (
    <Wrapper>
      <ProductsPage />
    </Wrapper>
  ),
});
