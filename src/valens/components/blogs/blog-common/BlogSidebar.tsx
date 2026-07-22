"use client"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import SocialIcon from "@v/components/common/SocialIcon"
import BlogRcPost from "./BlogRcPost"
import BlogCategory from "./BlogCategory"
import TwiterBlogPost from "./TwiterBlogPost"
import BlogInstagram from "./BlogInstagram"

const blogMe = "/assets/img/blog/me.png";
const blogBanner = "/assets/img/blog/banner.jpg";
import { Link } from "@tanstack/react-router"

const BlogSidebar = () => {
   return (
      <aside className="blog-sidebar pl-20">
         <div className="widget mb-40">
            <div className="sidebar-title mb-25">
               <h3 className="title">About Me</h3>
            </div>
            <div className="blog-about text-center">
               <div className="blog-avatar-img mb-25">
                  <Image src={blogMe} alt="img" />
               </div>
               <div className="b-about-content mb-20">
                  <h4>Rosalina D. Willaimson</h4>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore ullamco aliquip commodo.</p>
               </div>
               <div className="b-about-social">
                  <SocialIcon />
               </div>
            </div>
         </div>

         <div className="widget mb-40">
            <div className="sidebar-title mb-25">
               <h3 className="title">Search Objects</h3>
            </div>
            <div className="sidebar-search-form position-relative">
               <form onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Search your keyword..." />
                  <button><i className="fas fa-search"></i></button>
               </form>
            </div>
         </div>
         <BlogRcPost />
         <BlogCategory />

         <div className="widget mb-40">
            <div className="sidebar-title mb-25">
               <h3 className="title">Never Miss News</h3>
            </div>
            <div className="sidebar-social">
               <SocialIcon />
            </div>
         </div>
         <TwiterBlogPost />
         <BlogInstagram />

         <div className="banner-widget">
            <div className="sidebar-banner">
               <Link to="#">
                  <Image src={blogBanner} alt="img" />
               </Link>
            </div>
         </div>
      </aside>
   )
}

export default BlogSidebar
