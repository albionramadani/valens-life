// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import BlogSidebar from "../blog-common/BlogSidebar";
import { Link } from "@tanstack/react-router";
import BlogRelatedPost from "../blog-common/BlogRelatedPost";
import BlogComment from "../blog-common/BlogComment";
import BlogForm from "@v/components/forms/BlogForm";

const innerBlogThumb_1 = "/assets/img/blog/inner_blog_thumb01.jpg";
const innerBlogThumb_2 = "/assets/img/blog/inner_blog_thumb03.jpg";
const navigationFilter = "/assets/img/icons/c_d01.png";
const blogPostAvatar = "/assets/img/blog/bd_avatar_img.jpg";
interface ContentData {
   title_1: string;
   title_2: string;
   title_3: string;
   desc_1: React.ReactElement;
   desc_2: React.ReactElement;
   desc_3: React.ReactElement;
   desc_4: React.ReactElement;
   desc_5: React.ReactElement;
   desc_6: React.ReactElement;
   list: string[];
   blockquote: string;
   tag: string[];
   social_icon: string[];
}
const content_data: ContentData = {
   title_1: "Lorem ipsum dolor sit amet consecte cing elit sed do eiusmod tempor.",
   title_2: "A cleansing hot shower or bath",
   title_3: "Setting the mood with incense",
   desc_1: (<>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora et dolore magnam aliquam quaerat voluptatem.</>),
   desc_2: (<>Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.</>),
   desc_3: (<>Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.</>),
   desc_4: (<>Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.</>),
   desc_5: (<>Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</>),
   desc_6: (<>Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud today.</>),
   list: ["Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do.", "Dunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.", "Tion ullamco laboris nisi ut aliquip ex ea commodo consequat.", "Eprehenderit in voluptate velit esse cillum dolore eu fugiat.", "Ccaecat cupidatat non proident, sunt in culpa qui officia.",],
   blockquote: "Viral dreamcatcher keytar typewriter aest hetic offal umami. Aesthetic polaroid pug pitchfork post-ironic.",
   tag: ["Popular", "design", "ux"],
   social_icon: ["fab fa-twitter", "fab fa-pinterest-p", "fab fa-facebook-f", "fab fa-instagram", "fab fa-gg"]
}
const { title_1, desc_1, desc_2, title_2, desc_3, title_3, desc_4, list, blockquote, desc_5, tag, social_icon, desc_6 } = content_data;

const BlogDetailsArea = ({ single_blog }: any) => {
   return (
      <section className="blog-area pt-120 pb-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-8">
                  <div className="blog--post--item">
                     <div className="blog--post--thumb">
                        {single_blog?.img ?
                           <Image src={single_blog.img} alt="image" />
                           :
                           <Image src={innerBlogThumb_1} alt="image" />
                        }
                     </div>
                     <div className="blog--post--content blog-details-content">
                        <div className="blog--tag">
                           <Link to="#">Business</Link>
                        </div>
                        <h2 className="blog--post--title">
                           {single_blog?.title ? single_blog.title : title_1}</h2>
                        <div className="blog--post--meta mb-20">
                           <ul className="list-wrap">
                              <li><span><i className="far fa-eye"></i>232 Views</span></li>
                              <li><Link to="#"><i className="far fa-comments"></i>35 Comments</Link></li>
                              <li><span><i className="far fa-calendar-alt"></i>29th July 2022</span></li>
                           </ul>
                        </div>
                        <div className="post-text">
                           <p>{desc_1}</p>
                           <p>{desc_2}</p>
                           <div className="blog-details-post-thumb">
                              <Image src={innerBlogThumb_2} alt="img" />
                           </div>
                           <div className="blog-details-wrap">
                              <h3 className="title">{title_2}</h3>
                              <p>{desc_3}</p>
                           </div>
                           <div className="blog-details-wrap">
                              <h3 className="title">{title_3}</h3>
                              <p>{desc_4}</p>
                           </div>
                           <div className="blog-details-wrap border-none">
                              <h3 className="title">{title_3}</h3>
                              <div className="b-details-list">
                                 <ul className="list-wrap">
                                    {list.map((list, i) => (
                                       <li key={i}><i className="fas fa-check"></i>{list}</li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                           <blockquote>
                              <span>by <Link to="#">Hetmayar</Link></span>{blockquote}
                           </blockquote>
                           <p>{desc_5}</p>
                           <p>{desc_5}</p>
                           <div className="row mt-45 mb-50">
                              <div className="col-xl-6 col-md-7">
                                 <div className="d-post-tag">
                                    <h5>Releted Tags</h5>
                                    <ul className="list-wrap">
                                       {tag.map((tag, i) => <li key={i}><Link to="#">{tag}</Link></li>)}
                                    </ul>
                                 </div>
                              </div>
                              <div className="col-xl-6 col-md-5">
                                 <div className="post-share text-md-end">
                                    <h5>Social Share</h5>
                                    <ul className="list-wrap">
                                       {social_icon.map((icon, i) => <li key={i}><Link to="#"><i className={icon}></i></Link></li>)}
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="posts-navigation blog-post-navigation pt-35 pb-35">
                           <div className="row align-items-center">
                              <div className="col-md-5">
                                 <div className="prev-link">
                                    <span>Prev Post</span>
                                    <h4><Link to="#">Tips on Minimalist</Link></h4>
                                 </div>
                              </div>
                              <div className="col-md-2 text-start text-md-center">
                                 <Link to="/blog" className="navigation-filter"><Image src={navigationFilter} alt="" /></Link>
                              </div>
                              <div className="col-md-5">
                                 <div className="next-link text-start text-md-end">
                                    <span>Next Post</span>
                                    <h4><Link to="#">Less Is More</Link></h4>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <BlogRelatedPost />
                        <div className="blog-avatar-wrap mb-45">
                           <div className="blog-post-avatar-img">
                              <Image src={blogPostAvatar} alt="img" />
                           </div>
                           <div className="bd-avatar-info">
                              <span>Written by</span>
                              <h4>Rosalina D. William</h4>
                              <p>{desc_6}</p>
                           </div>
                        </div>
                        <BlogComment />
                        <BlogForm />
                     </div>
                  </div>
               </div>
               <div className="col-lg-4 col-md-7">
                  <BlogSidebar />
               </div>
            </div>
         </div>
      </section>
   )
}

export default BlogDetailsArea
