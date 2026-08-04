import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import Categories from "@v/components/homes/home/Categories";

export const Route = createFileRoute("/kategorite")({
  head: () => ({ meta: [{ title: "Kategorite - Valens" }] }),
  component: KategoritePage,
});

function KategoritePage() {
  return (
    <Wrapper>
      <HeaderOne style={true} />
      <main className="main-area fix valens-no-breadcrumb-page valens-no-breadcrumb-page--compact">
        <Categories />
      </main>
      <FooterOne style={true} />
    </Wrapper>
  );
}
