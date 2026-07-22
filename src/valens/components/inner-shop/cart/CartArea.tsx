'use client'
import { Link } from "@tanstack/react-router"
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import UseCartInfo from '@v/hooks/UseCartInfo';
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clear_cart, decrease_quantity, remove_cart_product } from '@v/redux/features/cartSlice';
import RemoveIcon from '@v/svg/RemoveIcon';

const CartArea = () => {

   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = UseCartInfo();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle the form submission here
   };


   return (
      <section className="eg-cart__area mb-95 valens-cart-area">
         <div className="container">

            {productItem.length === 0 ? (
               <div className="mb-30">
                  <div className="empty_bag text-center">
                     <p className="py-3">Shporta juaj eshte bosh</p>
                     <Link to={"/shop"}>
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
                                                <Image src={item.thumb} width={100} height={100} alt="bemet" />
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
                        
                     </div>
                  </div>
               </div>
            )}
         </div>
      </section>
   )
}

export default CartArea
