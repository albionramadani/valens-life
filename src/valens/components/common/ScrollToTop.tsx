"use client"
import UseSticky from "@v/hooks/UseSticky";
import React, { useState, useEffect } from "react";

type style_type = {
   style?: boolean
}
const ScrollToTop = ({ style }: style_type) => {
   const { sticky }: { sticky: boolean } = UseSticky();

   const [showScroll, setShowScroll] = useState(false);

   const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
         setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
         setShowScroll(false);
      }
   };

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   useEffect(() => {
      window.addEventListener("scroll", checkScrollTop);
      return () => window.removeEventListener("scroll", checkScrollTop);
   }, []);

   return (
      <>

         <button onClick={scrollTop} type="button" className={`scroll-top scroll-to-target ${sticky && "open"}`}>
            <i className="fas fa-angle-up"></i>
         </button>
      </>
   );
};

export default ScrollToTop;
