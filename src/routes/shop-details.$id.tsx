import { createFileRoute } from "@tanstack/react-router";
import Wrapper from "@v/layout/Wrapper";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import Breadcrumb from "@v/components/common/Breadcrumb";
import ShopDetailsArea from "@v/components/inner-shop/shop-details/ShopDetailsArea";
import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import { Loader2 } from "lucide-react";
import { useProductDetailsById } from "@/hooks/useProductDetailsById";

const FALLBACK_THUMB = "/assets/img/products/omega-3.svg";

const pickMainImage = (productImage?: string | null, gallery?: { url: string | null }[]) => {
  const galleryImage = (gallery || []).find((g) => g.url && g.url !== "-")?.url;
  return galleryImage || productImage || FALLBACK_THUMB;
};

export const Route = createFileRoute("/shop-details/$id")({
  head: () => ({ meta: [{ title: "Shop Details - Valens" }] }),
  component: ShopDetailsPage,
});

function ShopDetailsPage() {
  const { id } = Route.useParams();
  const { data: details, isLoading: isLoadingDetails, isError, error } = useProductDetailsById(id);
  const hasValidDetails = !!details?.product?.id;

  if (isLoadingDetails) {
    return (
      <Wrapper>
        <HeaderOne style={true} hideNavLinks />
        <main className="main-area fix valens-shop-details-page">
          <Breadcrumb compact showTrail={false} />
          <div className="container py-5 text-center">
            <Loader2 className="animate-spin" size={22} />
          </div>
        </main>
        <FooterOne style={false} />
      </Wrapper>
    );
  }

  if (isError) {
    return (
      <Wrapper>
        <HeaderOne style={true} hideNavLinks />
        <main className="main-area fix valens-shop-details-page">
          <Breadcrumb compact showTrail={false} />
          <div className="container py-5">
            <p>Gabim gjatë ngarkimit të produktit. Provo përsëri.</p>
            {import.meta.env.DEV && error instanceof Error ? (
              <p className="text-muted small">{error.message}</p>
            ) : null}
          </div>
        </main>
        <FooterOne style={false} />
      </Wrapper>
    );
  }

  if (!hasValidDetails) {
    return (
      <Wrapper>
        <HeaderOne style={true} hideNavLinks />
        <main className="main-area fix valens-shop-details-page">
          <Breadcrumb compact showTrail={false} />
          <div className="container py-5">
            <p>Produkti nuk u gjet për ID: {id}</p>
          </div>
        </main>
        <FooterOne style={false} />
      </Wrapper>
    );
  }

  const singleProduct = {
    id: details.product.id,
    title: details.product.name,
    slug: details.product.slug,
    price: Number(details.product.sale_price ?? details.product.base_price) || 0,
    base_price: Number(details.product.base_price) || 0,
    sale_price: details.product.sale_price,
    thumb: pickMainImage(details.product.image_url, details.gallery),
    valensSubtitle: details.product.categories?.name || "",
    stock_status: details.product.stock_status || "out_of_stock",
    description: details.product.description,
    variants: details.variants,
    gallery: details.gallery,
  };

  const relatedProducts = (details.related?.length
    ? details.related.map((r) => ({
        id: r.id,
        title: r.name,
        slug: r.slug,
        price: Number(r.base_price) || 0,
        thumb: r.image_url || FALLBACK_THUMB,
        class_name: "",
        valensSubtitle: r.categories?.name || "",
      }))
    : []);

  return (
    <Wrapper>
      <HeaderOne style={true} hideNavLinks />
      <main className="main-area fix valens-shop-details-page">
        <Breadcrumb compact showTrail={false} />
        <ShopDetailsArea single_product={singleProduct} key={singleProduct.id} />
        <CategoryProductsArea products={relatedProducts} title="Produkte të ngjashme" />
      </main>
      <FooterOne style={false} />
    </Wrapper>
  );
}
