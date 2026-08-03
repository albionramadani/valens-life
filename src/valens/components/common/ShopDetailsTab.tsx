"use client"
type StaticImageData = any;
const Image = (props: any) => { const { src, alt = '', width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = props; const ss = typeof src === 'string' ? src : (src && src.src) || ''; return <img src={ss} alt={alt} width={width} height={height} {...rest} />; };
import { useState, useRef } from "react";

const product_nav_1 = "/assets/img/products/shop-details-thumb01.png";
const product_nav_2 = "/assets/img/products/shop-details-thumb02.png";
type productNavImg = StaticImageData[];
const product_nav_img: productNavImg = [product_nav_1, product_nav_2]

type GalleryImage = { url: string; alt?: string | null };

type ShopDetailsTabProps = {
   image?: StaticImageData | string;
   gallery?: GalleryImage[];
   alt?: string;
};

const ShopDetailsTab = ({ image, gallery = [], alt = "Product image" }: ShopDetailsTabProps) => {
   const images: GalleryImage[] = gallery.length
      ? gallery
      : image
         ? [{ url: typeof image === "string" ? image : (image as any).src || "", alt }]
         : product_nav_img.map((src) => ({ url: src as string }));

   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
   const imageContainerRef = useRef<HTMLDivElement>(null);

   const handlePrev = () => {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
   };

   const handleNext = () => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
   };

   const activeImage = images[currentImageIndex] || images[0];

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageContainerRef.current) return;

      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Percentage position
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      setZoomPosition({ x: xPercent, y: yPercent });
   };

   const handleMouseEnter = () => {
      setIsZoomed(true);
   };

   const handleMouseLeave = () => {
      setIsZoomed(false);
   };

   return (
      <div className="col-lg-6">
         <div className="inner-shop-details-flex-wrap">
            <div className="inner-shop-gallery-controls">
               <button type="button" className="inner-shop-gallery-arrow prev" onClick={handlePrev} aria-label="Previous image">
                  <i className="fas fa-chevron-left"></i>
               </button>

               <div className="inner-shop-details-img-wrap inner-shop-gallery-wrap" style={{ overflow: "hidden", position: "relative" }}>
                  <div
                     className="inner-shop-details-img"
                     ref={imageContainerRef}
                     onMouseMove={handleMouseMove}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}
                     style={{
                        transition: isZoomed ? "none" : "transform 0.3s ease",
                        transform: isZoomed ? "scale(2)" : "scale(1)",
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        cursor: isZoomed ? "zoom-out" : "zoom-in",
                     }}
                  >
                     <Image
                        src={activeImage?.url || product_nav_img[0]}
                        alt={activeImage?.alt || alt}
                        style={{ width: "100%", maxWidth: "280px", height: "auto" }}
                     />
                  </div>
               </div>

               <button type="button" className="inner-shop-gallery-arrow next" onClick={handleNext} aria-label="Next image">
                  <i className="fas fa-chevron-right"></i>
               </button>
            </div>
         </div>
      </div>
   )
}

export default ShopDetailsTab
