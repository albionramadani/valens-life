'use client'
import { Link } from "@tanstack/react-router"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, className = "", onLoad, onError, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} className={`valens-lazy-image ${className}`.trim()} onLoad={(event) => { event.currentTarget.classList.add("is-loaded"); onLoad?.(event); }} onError={(event) => { event.currentTarget.classList.add("is-loaded"); onError?.(event); }} {...rest} />; };
import UseCartInfo from '@v/hooks/UseCartInfo';
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clear_cart, decrease_quantity, remove_cart_product } from '@v/redux/features/cartSlice';
import RemoveIcon from '@v/svg/RemoveIcon';
import { useEffect, useState } from 'react';

const VALENS_LOGO = "/assets/img/logo/Isolation_Mode.svg";
const IG_REDIRECT_SECONDS = 4;

// Handle-i i Instagram-it të Valens (pa "@") — https://www.instagram.com/valens.ks
const VALENS_INSTAGRAM = "valens.ks";

const copyToClipboard = (text: string): boolean => {
   try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
         navigator.clipboard.writeText(text);
         return true;
      }
   } catch {
      // fall through to legacy fallback
   }

   try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
   } catch {
      return false;
   }
};

const CartArea = () => {

   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = UseCartInfo();
   const [showIgPopup, setShowIgPopup] = useState(false);
   const [igCopied, setIgCopied] = useState(false);
   const [countdown, setCountdown] = useState(IG_REDIRECT_SECONDS);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle the form submission here
   };

   const orderViaInstagram = () => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const lines = productItem.map((item: any, index: number) => {
         const productUrl = `${origin}/shop-details/${item.id}`;
         return `${index + 1}. ${item.title} (x${item.quantity})\n${productUrl}`;
      });

      const message =
         `Përshëndetje Valens! 👋\n` +
         `Dua të porosis këto produkte:\n\n` +
         `${lines.join("\n\n")}\n\n` +
         `Totali: $${total.toFixed(2)}`;

      // Kopjo listën, pastaj shfaq popup-in me rikujtim para se ta hapim Instagram.
      const copied = copyToClipboard(message);
      setIgCopied(copied);
      setShowIgPopup(true);
   };

   // Kur hapet popup-i: numëro mbrapsht dhe ridrejto automatikisht te Instagram.
   useEffect(() => {
      if (!showIgPopup) return;

      setCountdown(IG_REDIRECT_SECONDS);
      const tick = setInterval(() => {
         setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
      const redirect = setTimeout(() => {
         window.location.href = `https://ig.me/m/${VALENS_INSTAGRAM}`;
      }, IG_REDIRECT_SECONDS * 1000);

      return () => {
         clearInterval(tick);
         clearTimeout(redirect);
      };
   }, [showIgPopup]);


   return (
    <>
      <section className="eg-cart__area mb-95 valens-cart-area">
         <div className="container">

            {productItem.length === 0 ? (
               <div className="mb-30">
                  <div className="empty_bag text-center">
                     <p className="py-3">Shporta juaj eshte bosh</p>
                     <Link to={"/produktet"}>
                        <button className="eg-btn btn-two">Shko te produktet</button>
                     </Link>
                  </div>
               </div>
            ) : (
               <div className="row justify-content-between">
                  <div className="col-xl-9 col-lg-8">
                     <div className="eg-cart mr-30">
                        <div className="eg-cart__responsive">
                           <table className="table eg-cart__table">
                              <thead>
                                 <tr>
                                    <th>Produkti</th>
                                    <th>Cmimi</th>
                                    <th>Sasia</th>
                                    {/* <th>Totali</th> */}
                                    <th></th>
                                 </tr>
                              </thead>

                              <tbody>
                                 {productItem.map((item: any, i: any) =>
                                    <tr key={i}>
                                       <td className="eg-cart__meta d-flex align-items-center">
                                          <div className="eg-cart__meta-img">
                                             <Link to={`/shop-details/${item.id}`}>
                                                <Image
                                                   src={item.thumb}
                                                   width={100}
                                                   height={100}
                                                   alt={item.title}
                                                   loading="lazy"
                                                   decoding="async"
                                                   fetchPriority="low"
                                                />
                                             </Link>
                                          </div>
                                          <h3 className="eg-cart__meta-title"><Link to={`/shop-details/${item.id}`}>{item.title}</Link></h3>
                                       </td>
                                       <td className="eg-cart__price"><span>{item.price}</span></td>
                                       <td className="eg-product-details__quantity-box">
                                          <div className="eg-product-details__quantity-box">
                                             <button onClick={() => dispatch(decrease_quantity(item))} className="eg-product-details__quantity-btn minus decrement"><i className="fa fa-minus"></i></button>
                                             <input className="counter" type="text" onChange={handleSubmit} value={item.quantity} readOnly />
                                             <button onClick={() => dispatch(addToCart(item))} className="eg-product-details__quantity-btn plus increment"><i className="fa fa-plus"></i></button>
                                          </div>
                                       </td>
                                       <td className="text-end">{item.total}</td>
                                       <td>
                                          <a style={{cursor:"pointer"}} onClick={() => dispatch(remove_cart_product(item))} className="table eg-cart__remove"><RemoveIcon /></a>
                                       </td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>

                        <div className="eg-cart__bottom mt-60">
                           <div className="row align-items-end">
                              <div className="col-xl-6 col-md-8 mb-25">
                                 <div className="eg-cart__coupon">
                                    <form action="#">
                                       <div className="eg-cart__coupon-input-box">
                                          <label>Kodi i kuponit:</label>
                                          <div className="eg-cart__coupon-input d-flex align-items-center">
                                             <input type="text" placeholder="Shkruaj kodin e kuponit" />
                                             <button type="submit">Apliko</button>
                                          </div>
                                       </div>
                                    </form>
                                 </div>
                              </div>
                              <div className="col-xl-6 col-md-4 mb-25">
                                 <div className="eg-cart__update text-md-end">
                                    <button onClick={() => dispatch(clear_cart())} type="button" className="eg-cart__update-btn eg-btn">Pastro shporten</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="col-xl-3 col-lg-4">
                     <div className="eg-cart-checkout__wrapper">
                        {/* <div className="eg-cart-checkout__top d-flex align-items-center justify-content-between">
                           <span className="eg-cart-checkout__top-title">Nentotali</span>
                           <span className="eg-cart-checkout__top-price">${total.toFixed(2)}</span>
                        </div> */}
                        <div className="eg-cart-checkout__total d-flex align-items-center justify-content-between">
                           <span>Totali</span>
                           <span>${total.toFixed(2)}</span>
                        </div>

                        <button
                           type="button"
                           onClick={orderViaInstagram}
                           className="eg-btn valens-cart-ig-btn"
                        >
                           <i className="fab fa-instagram" aria-hidden="true"></i>
                           Porosit përmes Instagram
                        </button>

                     </div>
                  </div>
               </div>
            )}
         </div>
      </section>

      {showIgPopup && (
         <div
            className="valens-ig-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="valens-ig-modal-title"
         >
            <div className="valens-ig-modal__overlay" />
            <div className="valens-ig-modal__box">
               <div className="valens-ig-modal__logo">
                  <img src={VALENS_LOGO} alt="Valens" />
               </div>
               <h3 id="valens-ig-modal-title" className="valens-ig-modal__title">
                  {igCopied ? "Lista u kopjua ✓" : "Porosia juaj"}
               </h3>
               <p className="valens-ig-modal__text">
                  {igCopied ? (
                     <>
                        Lista e produkteve u kopjua. Të lutem, kur të hapet
                        Instagram, <strong>bëj vetëm paste (ngjit)</strong>{" "}
                        mesazhin në bisedë.
                     </>
                  ) : (
                     <>
                        Hape bisedën në Instagram dhe na shkruaj produktet që
                        dëshiron të porosisësh.
                     </>
                  )}
               </p>

               <div className="valens-ig-modal__redirect" aria-live="polite">
                  <div className="valens-ig-modal__progress">
                     <span className="valens-ig-modal__progress-bar" />
                  </div>
                  <p className="valens-ig-modal__redirect-text">
                     Po ju ridrejtojmë te Instagram brenda {countdown}s…
                  </p>
               </div>
            </div>
         </div>
      )}
    </>
   )
}

export default CartArea
