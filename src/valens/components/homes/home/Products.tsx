
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import SliderImport from "react-slick";
import { useEffect, useState } from "react";
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

const getSliderLayout = (viewportWidth: number) => {
  if (viewportWidth < 576) {
    return { slidesToShow: 1, arrows: false };
  }

  if (viewportWidth < 992) {
    return { slidesToShow: 2, arrows: false };
  }

  if (viewportWidth < 1200) {
    return { slidesToShow: 3, arrows: true };
  }

  return { slidesToShow: 4, arrows: true };
};

const HomeOnePopularProducts = () => {
  const dispatch = useDispatch();
  const [hasMounted, setHasMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    setHasMounted(true);

    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  // Placeholder për dizajn: slider me 8 produkte (4 në pamje në desktop)
  const products = getPopularProducts(8);

  const sliderLayout = getSliderLayout(viewportWidth);

  const settings = {
    dots: true,
    infinite: true,
    speed: 900,
    autoplay: false,
    arrows: sliderLayout.arrows,
    slidesToShow: sliderLayout.slidesToShow,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
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
          {hasMounted ? (
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
                        <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                          <Image src={displayThumb} alt={displayTitle} />
                          {displayDiscount ? (
                            <span className="discount"> -{displayDiscount}%</span>
                          ) : null}
                        </Link>
                        <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
                      </div>
                      <div className="home-shop-content">
                        <h4 className="title">
                          <Link to="/shop-details/$id" params={{ id: String(item.id) }}>{displayTitle}</Link>
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
                          <Link to="/shop-details/$id" params={{ id: String(item.id) }} className="eg-btn btn-two">
                            Bli Tani
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          ) : (
            <div className="row home-shop-active valens-popular-slider">
              {products.slice(0, 4).map((item, index) => {
                const displayTitle = item.title;
                const displayDesc = item.valensSubtitle;
                const displayPrice = item.price;
                const displayDiscount = item.discount;
                const displayThumb = item.thumb;

                return (
                  <div key={`${item.page}-${item.id}-${index}`} className="col-xl-3 col-lg-4 col-md-6">
                    <div className="home-shop-item">
                      <div className="home-shop-thumb">
                        <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                          <Image src={displayThumb} alt={displayTitle} />
                          {displayDiscount ? (
                            <span className="discount"> -{displayDiscount}%</span>
                          ) : null}
                        </Link>
                        <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
                      </div>
                      <div className="home-shop-content">
                        <h4 className="title">
                          <Link to="/shop-details/$id" params={{ id: String(item.id) }}>{displayTitle}</Link>
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
                          <Link to="/shop-details/$id" params={{ id: String(item.id) }} className="eg-btn btn-two">
                            Bli Tani
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeOnePopularProducts;
