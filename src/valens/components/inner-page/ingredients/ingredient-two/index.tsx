import FooterOne from "@v/layout/footer/Footer"
import Breadcrumb from "@v/components/common/Breadcrumb";
// import HomeTwoSupplement from "@v/components/homes/home-two/HomeTwoSupplement";
// import HeaderTwo from "@v/layout/headers/HeaderTwo";
// import HomeTwoVideoArea from "@v/components/homes/home-two/HomeTwoVideoArea";
// import HomeTwoShop from "@v/components/homes/home-two/HomeTwoShop";

const IngredientTwo = () => {
  return (
    <>
      {/* <HeaderTwo style={true} /> */}
      <main className="fix">
        <Breadcrumb title="Ingredient Two" />
        {/* <HomeTwoSupplement  />
        <HomeTwoVideoArea/>
        <HomeTwoShop/> */}
      </main>
      <FooterOne style={true} />
    </>
  )
}

export default IngredientTwo;
