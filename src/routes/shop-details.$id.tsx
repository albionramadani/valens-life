import { createFileRoute, notFound } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import Breadcrumb from "@v/components/common/Breadcrumb";
import ShopDetailsArea from "@v/components/inner-shop/shop-details/ShopDetailsArea";
import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import { getPopularProducts } from "@v/utils/getPopularProducts";

export const Route = createFileRoute("/shop-details/$id")({
  head: () => ({ meta: [{ title: "Shop Details - Valens" }] }),
  component: ShopDetailsPage,
});

function ShopDetailsPage() {
  const { id } = Route.useParams();
  const productId = Number(id);
  const products = getPopularProducts(100);
  const singleProduct = products.find((p: any) => p.id === productId);
  if (!singleProduct) throw notFound();
  const relatedProducts = products.filter((p: any) => p.id !== singleProduct.id).slice(0, 4);
  return (
    <Wrapper>
      <HeaderOne style={true} hideNavLinks />
      <main className="main-area fix valens-shop-details-page">
        <Breadcrumb title="Shop Details" compact showTrail={false} />
        <ShopDetailsArea single_product={singleProduct} key={singleProduct.id} />
        <CategoryProductsArea products={relatedProducts} title="Produkte të ngjashme" />
      </main>
      <FooterOne style={false} />
    </Wrapper>
  );
}
