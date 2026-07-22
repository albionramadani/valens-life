
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import { useDispatch } from "react-redux";

import { addToCart } from "@v/redux/features/cartSlice";

interface CategoryProductsAreaProps {
  products: any[];
  title?: string;
}

const CategoryProductsArea = ({ products, title }: CategoryProductsAreaProps) => {
  const dispatch = useDispatch();

  const handleAddToCart = (item: any) => {
    dispatch(addToCart(item));
  };

  return (
    <section className="home-shop-area inner-home-shop valens-popular-area">
      <div className="container">
        <div className="related-products-wrap">
          {title ? (
            <div className="section-title mb-40 valens-popular-head">
              <h2 className="title">{title}</h2>
            </div>
          ) : null}
          <div className="row">
            {products.map((item) => (
              <div key={item.id} className="col-xl-3 col-lg-4 col-md-6">
                <div className="home-shop-item">
                  <div className="home-shop-thumb">
                    <Link to={`/shop-details/${item.id}`}>
                      <Image src={item.thumb} alt={item.title} />
                      {item.discount ? (
                        <span className="discount"> -{item.discount}%</span>
                      ) : null}
                    </Link>
                    <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
                  </div>
                  <div className="home-shop-content">
                    <h4 className="title">
                      <Link to={`/shop-details/${item.id}`}>{item.title}</Link>
                    </h4>
                    {item.valensSubtitle ? (
                      <p className="valens-popular-subtitle">{item.valensSubtitle}</p>
                    ) : null}
                    <span className="home-shop-price">{Number(item.price).toFixed(2)}</span>
                    <div className="shop-content-bottom">
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAddToCart(item)}
                        className="cart"
                      >
                        <i className="flaticon-shopping-cart-1"></i>
                      </a>
                      <Link to={`/shop-details/${item.id}`} className="eg-btn btn-two">
                        Bli Tani
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryProductsArea;
