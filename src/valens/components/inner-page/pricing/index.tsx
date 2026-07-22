import HeaderOne from "@v/layout/headers/HeaderOne"
import FooterOne from "@v/layout/footer/Footer"
import Breadcrumb from "@v/components/common/Breadcrumb";

const Pricing = () => {
  return (
    <>
      <HeaderOne style={true} />
      <main className="fix">
        <Breadcrumb title="Pricing Area" />
      </main>
      <FooterOne style={true} />
    </>
  )
}

export default Pricing;
