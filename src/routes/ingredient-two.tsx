import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import IngredientTwo from "@v/components/inner-page/ingredients/ingredient-two";

export const Route = createFileRoute("/ingredient-two")({
  head: () => ({ meta: [{ title: "Ingredient Two - Valens" }] }),
  component: () => (
    <Wrapper>
      <IngredientTwo />
    </Wrapper>
  ),
});
