import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import Ingredient from "@v/components/inner-page/ingredients/ingredient-one";

export const Route = createFileRoute("/ingredient")({
  head: () => ({ meta: [{ title: "Ingredient - Valens" }] }),
  component: () => (
    <Wrapper>
      <Ingredient />
    </Wrapper>
  ),
});
