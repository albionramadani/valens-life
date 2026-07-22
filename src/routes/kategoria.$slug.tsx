import { createFileRoute, notFound } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import Header from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import CategoryHero from "@v/components/inner-shop/category/CategoryHero";
import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import { getCategoryBySlug } from "@v/data/CategoryData";
import { getPopularProducts } from "@v/utils/getPopularProducts";

export const Route = createFileRoute("/kategoria/$slug")({
  head: () => ({ meta: [{ title: "Kategoria - Valens" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategoryBySlug(slug);
  if (!category) throw notFound();
  const products = getPopularProducts(4);
  return (
    <Wrapper>
      <Header style={true} />
      <main className="main-area fix">
        <CategoryHero category={category} />
        <CategoryProductsArea products={products} />
      </main>
      <FooterOne style={false} />
    </Wrapper>
  );
}
