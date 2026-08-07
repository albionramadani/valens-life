import ShopDetailsTab from '@v/components/common/ShopDetailsTab'
import { addToCart, decrease_quantity } from '@v/redux/features/cartSlice';
import { Link, useNavigate } from '@tanstack/react-router'
import { useDispatch, useSelector } from 'react-redux';
import { PRODUCT_TAGS_BY_SKU } from '@/data/productTagsBySku';

const FALLBACK_THUMB = "/assets/img/products/omega-3.svg";

// Render Odoo notes cleanly: decode HTML entities and keep one bullet per line.
// After a fresh sync the text already has real newlines; this is also a safe
// fallback for older data where line breaks were lost.
const formatNotes = (raw: any): string => {
   let t = String(raw || "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#0?39;|&apos;/gi, "'")
      .replace(/\t/g, " ");
   if (!/\n/.test(t) && t.includes("•")) {
      t = t.replace(/\s*•\s*/g, "\n• ");
   }
   return t.replace(/[ ]{2,}/g, " ").trim();
};

const ShopDetailsArea = ({ single_product }: any) => {

   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle the form submission here
   };
   const handleAddToCart = (item: any) => {
      dispatch(addToCart(item));
   };
   const handleBuyNow = (item: any) => {
      dispatch(addToCart(item));
      void navigate({ to: "/cart" });
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
   const longDescription = formatNotes(single_product?.longDescription);
   const image = single_product?.thumb || FALLBACK_THUMB;
   // Tags matched by SKU (Internal Reference) against the Odoo list (xlsx).
   const primarySku = String(single_product?.sku || variants[0]?.sku || "").trim();
   const skuTags = (primarySku && PRODUCT_TAGS_BY_SKU[primarySku]) || [];

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
                         {skuTags.length ? (
                           <div className="valens-details-tags valens-shop-card-design">
                              <div className="valens-card-tags">
                                 {skuTags.map((tag: string, i: number) => (
                                    <span key={i} className="valens-card-tag">{tag}</span>
                                 ))}
                              </div>
                           </div>
                        ) : null}
                        <div className="inner-shop-details-price">
                           <h2 className="price">€{displayPrice.toFixed(2)}</h2>
                           <h5 className="stock-status">- {stockText}{stockStatus === "in_stock" && totalStock > 0 ? ` (${totalStock})` : ""}</h5>
                        </div>

                        {longDescription ? (
                           <p className="valens-details-longdesc">{longDescription}</p>
                        ) : null}

                        <div className="inner-shop-perched-info">
                           <div className="sd-cart-wrap">
                              <form onSubmit={e => e.preventDefault()}>
                                 <div className="quickview-cart-plus-minus">
                                    <input type="text" onChange={handleSubmit} value={totalItems?.quantity ? totalItems?.quantity : 1} readOnly />
                                    <div onClick={() => single_product ? dispatch(decrease_quantity(single_product)) : ""} className="dec qtybutton">-</div>
                                    <div onClick={() => single_product ? dispatch(addToCart(single_product)) : ""} className="inc qtybutton">+</div>
                                 </div>
                              </form>
                           </div>

                           <div className="valens-details-actions valens-shop-card-design">
                              <div className="shop-content-bottom">
                                 <button
                                    type="button"
                                    onClick={() => single_product ? handleAddToCart(single_product) : undefined}
                                    className="cart"
                                    aria-label={`Shto ${title} në shportë`}
                                 >
                                    <i className="flaticon-shopping-cart-1" aria-hidden="true"></i>
                                    <span>Shto në shportë</span>
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => single_product ? handleBuyNow(single_product) : undefined}
                                    className="eg-btn btn-two"
                                    aria-label={`Blej ${title} tani`}
                                 >
                                    Blej tani
                                 </button>
                              </div>
                           </div>
                        </div>


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
