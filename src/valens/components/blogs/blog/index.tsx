import Breadcrumb from "@v/components/common/Breadcrumb"
import FooterOne from "@v/layout/footer/Footer"
import HeaderOne from "@v/layout/headers/HeaderOne"
import BlogArea from "./BlogArea"

const Blog = () => {
   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix">
            <Breadcrumb title="Our Blog" />
            <BlogArea/>
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default Blog
