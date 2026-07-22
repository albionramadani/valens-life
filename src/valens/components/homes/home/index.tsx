import Header from "@v/layout/headers/HeaderOne"
import Home from "./Home"
import Categories from "./Categories"
import About from "./About"
import Footer from "@v/layout/footer/Footer"
import Products from "./Products"
import Faq from "./Faq"

const HomeOne = () => {
  return (
    <>
      <Header style={true} />
      <main className="main-area fix">
        <Home />
        <Categories />
        <About />
        <Products />
        <Faq />
      </main>
      <Footer style={true} />
    </>
  )
}

export default HomeOne
