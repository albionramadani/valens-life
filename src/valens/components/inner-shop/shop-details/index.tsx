import Breadcrumb from "@v/components/common/Breadcrumb"
import FooterOne from "@v/layout/footer/Footer";
import HeaderOne from "@v/layout/headers/HeaderOne"
import ShopDetailsArea from "./ShopDetailsArea";

const ShopDetails = () => {
   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix valens-shop-details-page">
            <Breadcrumb title="Shop Details" compact />
            <ShopDetailsArea />
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default ShopDetails;
