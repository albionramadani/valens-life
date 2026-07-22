import Breadcrumb from "@v/components/common/Breadcrumb"
import FooterOne from "@v/layout/footer/Footer";
import HeaderOne from "@v/layout/headers/HeaderOne"
import CartArea from "./CartArea";

const Cart = () => {
   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix valens-cart-page">
            <Breadcrumb title="Shporta" compact showTrail={false} />
            <CartArea/>
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default Cart;
