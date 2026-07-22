
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import SliderImport from "react-slick";
const Slider: any = (SliderImport as any).default ?? SliderImport;
import { useDispatch } from "react-redux";

import { addToCart } from "@v/redux/features/cartSlice";

import { getPopularProducts } from "@v/utils/getPopularProducts";

const CustomPrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} type="button" className="slick-prev slick-arrow">
      <i className="flaticon-left-arrow"></i>
    </button>
  );
};

const CustomNextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} type="button" className="slick-next slick-arrow">
      <i className="flaticon-right-arrow"></i>
    </button>
  );
};

const HomeOnePopularProducts = () => {
  const dispatch = useDispatch();

  // Placeholder për dizajn: slider me 8 produkte (4 në pamje në desktop)
  const products = getPopularProducts(8);

  const settings = {
    dots: true,
    infinite: true,
    speed: 900,
    autoplay: false,
    arrows: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, arrows: false },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1, arrows: false },
      },
    ],
  };

  const handleAddToCart = (item: any) => {
    dispatch(addToCart(item));
  };

  return (
    <section id="products" className="home-shop-area valens-popular-area">
      <div className="container">
        <div className="related-products-wrap">
          <div className="section-title mb-60 valens-popular-head">
            <h2 className="title">Produktet më të kërkuara</h2>
            <div className="valens-popular-all-wrap">
              <Link to="/shop" className="valens-popular-all-btn">
                <span>Shiko Te Gjitha Produktet</span>
                <i className="flaticon-right-arrow" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
          <Slider {...settings} className="row home-shop-active valens-popular-slider">
            {products.map((item, index) => {
              const displayTitle = item.title;
              const displayDesc = item.valensSubtitle;
              const displayPrice = item.price;
              const displayDiscount = item.discount;
              const displayThumb = item.thumb;

              return (
                <div key={`${item.page}-${item.id}-${index}`} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="home-shop-item">
                    <div className="home-shop-thumb">
                      <Link to={`/shop-details/${item.id}`}>
                        <Image src={displayThumb} alt={displayTitle} />
                        {displayDiscount ? (
                          <span className="discount"> -{displayDiscount}%</span>
                        ) : null}
                      </Link>
                      <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
                    </div>
                    <div className="home-shop-content">
                      <h4 className="title">
                        <Link to={`/shop-details/${item.id}`}>{displayTitle}</Link>
                      </h4>
                      {displayDesc ? <p className="valens-popular-subtitle">{displayDesc}</p> : null}
                      <span className="home-shop-price">{Number(displayPrice).toFixed(2)}</span>
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
              );
            })}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default HomeOnePopularProducts;
