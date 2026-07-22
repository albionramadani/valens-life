"use client"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import Slider from 'react-slick'
import { useState } from "react";
import ImagePopup from "@v/modals/ImagePopup";

const insta_data: string[] = ["/assets/img/others/instagram_post01.jpg", "/assets/img/others/instagram_post02.jpg", "/assets/img/others/instagram_post03.jpg", "/assets/img/others/instagram_post04.jpg", "/assets/img/others/instagram_post05.jpg"]

// slider setting
const setting = {
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
	arrows: false,
	swipe: false,
	slidesToShow: 5,
	slidesToScroll: 1,
	responsive: [
		{
		breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
		breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
		breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
		breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
};

const FooterInstagram = () => {

   // photoIndex
   const [photoIndex, setPhotoIndex] = useState(null);
   // image open state
   const [isOpen, setIsOpen] = useState(false);
   // handleImagePopup
   const handleImagePopup = (i: any) => {
      setPhotoIndex(i);
      setIsOpen(true);
   };
   //  images
   const images = insta_data.map((item) => item);

   return (
      <>
         <div className="footer-instagram">
            <div className="container">
               <Slider {...setting} className="row g-0 instagram-active">
                  {insta_data.map((item, index) => (
                     <div key={index} className="col-2">
                        <div className="footer-insta-item">
                           <a onClick={() => handleImagePopup(index)} className="popup-image"><Image src={item} width={258} height={258} alt="img" /></a>
                        </div>
                     </div>
                  ))}
               </Slider>
            </div>
         </div>
         {isOpen && (
            <ImagePopup
               images={images}
               setIsOpen={setIsOpen}
               photoIndex={photoIndex}
               setPhotoIndex={setPhotoIndex}
            />
         )}
      </>
   )
}

export default FooterInstagram
