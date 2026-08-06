import ShopDetailsTab from '@v/components/common/ShopDetailsTab'
import { addToCart, decrease_quantity } from '@v/redux/features/cartSlice';
import { Link } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux';

const FALLBACK_THUMB = "/assets/img/products/omega-3.svg";

const ShopDetailsArea = ({ single_product }: any) => {

   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle the form submission here
   };
   const handleAddToCart = (item: any) => {
      dispatch(addToCart(item));
   };
   const totalItems = productItem.find((d_item: any) => d_item?.id === single_product?.id)

   const variants = Array.isArray(single_product?.variants) ? single_product.variants : [];
   const hasVariants = variants.length > 0;
   const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => Number(v.price) || 0).filter((p: number) => p > 0)) : 0;
   const displayPrice = Number(single_product?.price) > 0 ? Number(single_product.price) : minVariantPrice;
   const totalStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) : 0;
   const stockStatus = String(single_product?.stock_status || "out_of_stock");
   const stockText = stockStatus === "in_stock" ? "Në stok" : stockStatus === "coming_soon" ? "Së shpejti" : "Jashtë stokut";
   const title = single_product?.title || single_product?.name || "Produkt";
   const image = single_product?.thumb || FALLBACK_THUMB;

   return (
      <>
         <section className="inner-shop-details-area">
            <div className="container">
               <div className="row">
                  <ShopDetailsTab
                     image={image}
                     gallery={(single_product?.gallery || []).map((g: any) => ({ url: g.url, alt: g.alt }))}
                     alt={title}
                  />

                  <div className="col-lg-6">
                     <div className="inner-shop-details-content">
                        <h4 className="title">{title}</h4>
                        {single_product?.description ? (
                           <p className="valens-details-desc">{single_product.description}</p>
                        ) : null}
                        <div className="inner-shop-details-price">
                           <h2 className="price">€{displayPrice.toFixed(2)}</h2>
                           <h5 className="stock-status">- {stockText}{stockStatus === "in_stock" && totalStock > 0 ? ` (${totalStock})` : ""}</h5>
                        </div>

                        {hasVariants ? (
                           <div className="inner-shop-details-list">
                              <ul className="list-wrap">
                                 <li>Variante aktive: <span>{variants.length}</span></li>
                                 <li>SKU kryesor: <span>{variants[0]?.sku || "-"}</span></li>
                              </ul>
                           </div>
                        ) : null}

                        <div className="inner-shop-perched-info shop-content-bottom">
                           <div className="sd-cart-wrap">
                              <form onSubmit={e => e.preventDefault()}>
                                 <div className="quickview-cart-plus-minus">
                                    <input type="text" onChange={handleSubmit} value={totalItems?.quantity ? totalItems?.quantity : 1} readOnly />
                                    <div onClick={() => single_product ? dispatch(decrease_quantity(single_product)) : ""} className="dec qtybutton">-</div>
                                    <div onClick={() => single_product ? dispatch(addToCart(single_product)) : ""} className="inc qtybutton">+</div>
                                 </div>
                              </form>
                           </div>
                           <a
                              style={{ cursor: "pointer" }}
                              onClick={() => single_product ? handleAddToCart(single_product) : ""}
                              className="cart"
                              aria-label="Shto në shportë"
                           >
                              <i className="flaticon-shopping-cart-1" aria-hidden="true"></i>
                           </a>
                        </div>

                        {hasVariants ? (
                           <div className="inner-shop-details-list mt-3">
                              <ul className="list-wrap">
                                 {variants.slice(0, 6).map((v: any) => (
                                    <li key={v.id}>
                                       {v.name || "Variant"} <span>€{Number(v.price || 0).toFixed(2)} · stok {Number(v.stock || 0)}</span>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        ) : null}

                        <div className="valens-back-home-wrap">
                           <Link to="/" className="valens-popular-all-btn">
                              <span>Kthehu në Ballinë</span>
                              <i className="flaticon-right-arrow" aria-hidden="true"></i>
                           </Link>
                        </div>
                        
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </>
   )
}

export default ShopDetailsArea
