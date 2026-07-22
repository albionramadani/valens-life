import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";

export const Route = createFileRoute("/paroller")({
  head: () => ({ meta: [{ title: "Paroller - Valens" }] }),
  component: () => (
    <Wrapper>
      <div />
    </Wrapper>
  ),
});
