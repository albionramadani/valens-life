"use client"
import blog_data from "@v/data/BlogData"
import VideoPopup from "@v/modals/VideoPopup"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import Slider from "react-slick"
import BlogSidebar from "../blog-common/BlogSidebar"

const CustomPrevArrow = (props: any) => {
   const { onClick } = props;
   return (
      <button onClick={onClick} type="button" className="slick-prev slick-arrow" ><i className="fas fa-arrow-left"></i></button>
   );
};

const CustomNextArrow = (props: any) => {
   const { onClick } = props;
   return (
      <button onClick={onClick} type="button" className="slick-next slick-arrow"><i className="fas fa-arrow-right"></i></button>
   );
};

const settings = {
   dots: false,
   infinite: true,
   arrows: true,
   speed: 1500,
   slidesToShow: 1,
   slidesToScroll: 1,
   fade: true,
   prevArrow: <CustomPrevArrow />,
   nextArrow: <CustomNextArrow />,
}

const BlogArea = () => {

   const [currentPage, setCurrentPage] = useState(1);
   const [isVideoOpen, setIsVideoOpen] = useState(false);

   const blogs = blog_data.filter(items => items.page === "blog")

   const itemsPerPage = 8;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = blogs.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(blogs.length / itemsPerPage);

   // click to request another page.
   const handlePageClick = (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > totalPages) {
        return; // Avoid going to negative pages or beyond the total number of pages
      }
  
      const newOffset = (pageNumber - 1) * itemsPerPage; // Calculate the new offset
      setItemOffset(newOffset);
      setCurrentPage(pageNumber); // Update the currentPage state
    };
   
   // Calculate total number of pages
   const totalPages = Math.ceil(blogs.length / itemsPerPage);

   // Generate an array of page numbers
   const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

   // Render pagination links
   const renderPaginationLinks = () => {
      return pageNumbers.map((pageNumber) => (
         <li key={pageNumber} className={pageNumber === currentPage ? 'active' : ''}>
            <a style={{cursor:"pointer"}} onClick={() => handlePageClick(pageNumber)}>
               {pageNumber}
            </a>
         </li>
      ));
   };

   return (
      <>
         <section className="blog-area pt-120 pb-120">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-8">
                     {currentItems.filter((item) => item.page === "blog").map((item) => (
                        <div key={item.id} className="blog--post--item mb-40">
                           <div className={`blog--post--thumb ${item.class_name}`}>
                              {item.img ? <Link to={`/blog-details/${item.id}`}>
                                 <Image src={item.img} alt="img" />
                              </Link> : ""
                              }
                              {item.video ? <a onClick={() => setIsVideoOpen(true)} className="video--icon popup-video">
                                 <i className="fas fa-play"></i>
                              </a> : ""
                              }
                           </div>

                           {item.slider ? <Slider {...settings} className="blog--post--thumb blog-thumb-active">
                              {item.slider.map((slider, i) => (
                                 <div key={i} className="slide-post">
                                    <Image src={slider} alt="" />
                                 </div>
                              ))}
                           </Slider> : ""
                           }

                           {item.ratio ? <div className="blog--post--item mb-40">
                              <div className="blog--post--thumb ratio ratio-16x9">
                                 {/* <iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/645155892&color=%23FAA432&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true" allowFullScreen></iframe> */}
                                 <iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/645155892&color=%23FAA432&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true" allowFullScreen></iframe>
                              </div>
                           </div> : ""
                           }

                           {item.blog_bg ? (
                              <div className={`blog--post--content ${item.quote?"quote-post":""}`} style={{ backgroundImage: `url(${item.blog_bg})` }}>
                                 {item.quote ? "" : <div className="blog--tag">
                                    <Link to="#">{item.tag}</Link>
                                 </div>}

                                 {item.quote ?<div className="quote-icon">
                                    <Image src={item.quote} alt="" />
                                 </div>:""}
                                 <div className="fix">
                                    <h2 className="blog--post--title"><Link to="/blog-details">{item.title}</Link></h2>
                                    <div className="blog--post--meta">
                                       <ul className="list-wrap">
                                          <li><span><i className="far fa-eye"></i>{item.view}</span></li>
                                          <li><Link to="#"><i className="far fa-comments"></i>{item.comment}</Link></li>
                                          <li><span><i className="far fa-calendar-alt"></i>{item.date}</span></li>
                                       </ul>
                                    </div>
                                 </div>
                              </div>)
                              : (
                              <div className="blog--post--content">
                                 <div className="blog--tag">
                                    <Link to="#">{item.tag}</Link>
                                 </div>
                                 <h2 className="blog--post--title"><Link to={`/blog-details/${item.id}`}>{item.title}</Link></h2>
                                 <div className={`blog--post--meta ${item.blog_bg ? "" : "mb-20"}`}>
                                    <ul className="list-wrap">
                                       <li><span><i className="far fa-eye"></i>{item.view}</span></li>
                                       <li><Link to="#"><i className="far fa-comments"></i>{item.comment}</Link></li>
                                       <li><span><i className="far fa-calendar-alt"></i>{item.date}</span></li>
                                    </ul>
                                 </div>
                                 <div className="post-text">
                                    <p>{item.desc}</p>
                                 </div>
                                 <div className="blog--post--bottom">
                                    <div className="blog--post--avatar">
                                       <div className="blog--avatar--img">
                                          <Image src={item.avatar ? item.avatar : ""} alt="img" />
                                       </div>
                                       <div className="blog--avatar--info">
                                          <p>by <Link to="#">{item.avatar_name}</Link></p>
                                       </div>
                                    </div>
                                    <div className="blog--read--more">
                                       <Link to="/blog-details"><i className="fas fa-arrow-right"></i>Read More</Link>
                                    </div>
                                 </div>
                              </div>
                           )
                           }
                        </div>
                     ))}
                     
                     <div className="pagination-wrap">
                       <ul className="list-wrap">
                         <li className="prv-next">
                           <a
                             onClick={() => handlePageClick(currentPage - 1)}
                             style={{ cursor: 'pointer' }}
                             className={currentPage === 1 ? 'disabled' : ''}
                           >
                             <i className="fas fa-angle-double-left"></i>
                           </a>
                         </li>
                         {renderPaginationLinks()}
                         <li className="prv-right">
                           <a
                             onClick={() => handlePageClick(currentPage + 1)}
                             style={{ cursor: 'pointer' }}
                             className={currentPage === totalPages ? 'disabled' : ''}
                           >
                             <i className="fas fa-angle-double-right"></i>
                           </a>
                         </li>
                       </ul>
                     </div>
                  </div>
                  <div className="col-lg-4">
                     <BlogSidebar/>
                  </div>
               </div>
            </div>
         </section>
         {/* video modal start */}
         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"Ml4XCF-JS0k"}
         />
         {/* video modal end */}
      </>
   )
}

export default BlogArea
