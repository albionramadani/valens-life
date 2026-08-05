import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import Faq from "@v/components/homes/home/Faq";

export const Route = createFileRoute("/pyetje")({
  head: () => ({ meta: [{ title: "Pyetje - Valens" }] }),
  component: PyetjePage,
});

function PyetjePage() {
  return (
    <Wrapper>
      <HeaderOne style={true} />
      <main className="main-area fix valens-no-breadcrumb-page valens-no-breadcrumb-page--questions">
        <Faq />
      </main>
      <FooterOne style={true} />
    </Wrapper>
  );
}
