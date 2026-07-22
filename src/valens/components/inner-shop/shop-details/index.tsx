import Breadcrumb from "@v/components/common/Breadcrumb"
import CategoryProductsArea from "@v/components/inner-shop/category/CategoryProductsArea";
import FooterOne from "@v/layout/footer/Footer";
import HeaderOne from "@v/layout/headers/HeaderOne"
import ShopDetailsArea from "./ShopDetailsArea";

const relatedProductsStatic = [
   {
      id: 1,
      title: "Super Omega 3",
      price: 85.99,
      discount: 10,
      thumb: "/assets/img/products/omega-3.svg",
      class_name: "",
      valensSubtitle: "Mbështet shëndetin e zemrës dhe qarkullimin",
   },
   {
      id: 3,
      title: "Ashwagandha",
      price: 120.99,
      discount: 16,
      thumb: "/assets/img/products/ashwagandha.svg",
      class_name: "",
      valensSubtitle: "Mbështet kockat dhe sistemin imunitar",
   },
   {
      id: 4,
      title: "Melatonin",
      price: 90.99,
      thumb: "/assets/img/products/melatonin.svg",
      class_name: "",
      valensSubtitle: "Ndihmon në një gjumë më të qetë dhe të rregullt",
   },
   {
      id: 2,
      title: "Magnesium Caps",
      price: 88.99,
      thumb: "/assets/img/products/magnesium-test.svg",
      class_name: "",
      valensSubtitle: "Ndihmon në relaksimin e muskujve dhe gjumë më të mirë",
   },
];

const ShopDetails = () => {
   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix valens-shop-details-page">
            <Breadcrumb title="Shop Details" compact showTrail={false} />
            <ShopDetailsArea />
            <CategoryProductsArea
               products={relatedProductsStatic}
               title="Produkte të ngjashme"
            />
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default ShopDetails;
