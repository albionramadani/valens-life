import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HomeOne from "@v/components/homes/home";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Valens" }] }),
  component: Home,
});

function Home() {
  return (
    <Wrapper>
      <HomeOne />
    </Wrapper>
  );
}
