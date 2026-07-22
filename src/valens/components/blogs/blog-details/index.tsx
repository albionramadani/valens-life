import Breadcrumb from "@v/components/common/Breadcrumb"
import FooterOne from "@v/layout/footer/Footer"
import HeaderOne from "@v/layout/headers/HeaderOne"
import BlogDetailsArea from "./BlogDetailsArea"

const BlogDetails = () => {
   return (
      <>
         <HeaderOne style={true} />
         <main className="main-area fix">
            <Breadcrumb title="Blog Details" />
            <BlogDetailsArea/>
         </main>
         <FooterOne style={false} />
      </>
   )
}

export default BlogDetails
