import FooterOne from "@v/layout/footer/Footer";
import HeaderOne from "@v/layout/headers/HeaderOne"

import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import { getPopularProducts } from "@v/utils/getPopularProducts";


const Shop = () => {
   const products = getPopularProducts(12);

   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix valens-shop-page">
            <h1 className="">Our Shop</h1>
            <CategoryProductsArea products={products} />
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default Shop;
