import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import Breadcrumb from "@v/components/common/Breadcrumb";
import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import { Loader2 } from "lucide-react";
import { useStorefrontShopProducts } from "@/hooks/useStorefrontShopProducts";

const ProductsPage = () => {
  const { data: products = [], isLoading } = useStorefrontShopProducts();

  return (
    <>
      <HeaderOne style={true} />
      <main className="main-area fix valens-shop-page">
        <Breadcrumb title="Produktet" compact />
        {isLoading && !products.length ? (
          <div className="container py-5 text-center">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : (
          <CategoryProductsArea products={products} />
        )}
      </main>
      <FooterOne style={false} />
    </>
  );
};

export default ProductsPage;
