import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import AboutContent from "@v/components/inner-page/about";

export const Route = createFileRoute("/rreth-nesh")({
  head: () => ({ meta: [{ title: "Rreth nesh - Valens" }] }),
  component: RrethNeshPage,
});

function RrethNeshPage() {
  return (
    <Wrapper>
      <HeaderOne style={true} />
      <main className="main-area fix">
        <AboutContent />
      </main>
      <FooterOne style={true} />
    </Wrapper>
  );
}
