import { Link } from "@tanstack/react-router"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };

const breadcrumbShape_1 = "/assets/img/others/video_shape01.png";
const breadcrumbShape_2 = "/assets/img/others/video_shape02.png";
type BreadcrumbProps = {
   title: string;
   compact?: boolean;
   showTrail?: boolean;
};

const Breadcrumb = ({ title, compact = false, showTrail = true }: BreadcrumbProps) => {
   return (
      <section className={`breadcrumb-area breadcrumb-bg${compact ? ' breadcrumb-compact' : ''}`}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-10">
                  <div className="breadcrumb-content text-center">
                     <h2 className="title">{title}</h2>
                     {showTrail ? (
                        <nav aria-label="Breadcrumbs" className="breadcrumb-trail">
                           <ul className="breadcrumb">
                              <li className="breadcrumb-item trail-item trail-begin">
                                 <Link to="/"><span>Home</span></Link>
                              </li>
                              <li className="breadcrumb-item trail-item trail-end"><span>{title}</span></li>
                           </ul>
                        </nav>
                     ) : null}
                  </div>
               </div>
            </div>
         </div>
         {!compact ? (
            <>
               {/* <div className="video-shape one"><Image src={breadcrumbShape_1} alt="shape" /></div> */}
               {/* <div className="video-shape two"><Image src={breadcrumbShape_2} alt="shape" /></div> */}
            </>
         ) : null}
      </section>
   )
}

export default Breadcrumb
