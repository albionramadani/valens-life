import HeaderOne from "@v/layout/headers/HeaderOne"
import FooterOne from "@v/layout/footer/Footer"
import Breadcrumb from "@v/components/common/Breadcrumb";

const IngredientOne = () => {
  return (
    <>
      <HeaderOne style={true} />
      <main className="fix">
        <Breadcrumb title="Ingredient" />
      </main>
      <FooterOne style={true} />
    </>
  )
}

export default IngredientOne;
