
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, className = "", onLoad, onError, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} className={`valens-lazy-image ${className}`.trim()} onLoad={(event) => { event.currentTarget.classList.add("is-loaded"); onLoad?.(event); }} onError={(event) => { event.currentTarget.classList.add("is-loaded"); onError?.(event); }} {...rest} />; };
import { Link, useNavigate } from "@tanstack/react-router";
import SliderImport from "react-slick";
import { useEffect, useState } from "react";
const Slider: any = (SliderImport as any).default ?? SliderImport;
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";

import { addToCart } from "@v/redux/features/cartSlice";
import { useStorefrontShopProducts } from "@/hooks/useStorefrontShopProducts";

const CustomPrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} type="button" className="slick-prev slick-arrow" aria-label="Produkti i mëparshëm">
      <i className="flaticon-left-arrow" aria-hidden="true"></i>
    </button>
  );
};

const CustomNextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button onClick={onClick} type="button" className="slick-next slick-arrow" aria-label="Produkti tjetër">
      <i className="flaticon-right-arrow" aria-hidden="true"></i>
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
  const navigate = useNavigate();
  const [hasMounted, setHasMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const { data: products = [], isLoading } = useStorefrontShopProducts();

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

  const handleBuyNow = (item: any) => {
    dispatch(addToCart(item));
    void navigate({ to: "/cart" });
  };

  const renderProductCard = (item: any, index: number) => {
    const displayTitle = item.title;
    const displayCategory = item.valensSubtitle;
    const displayPrice = item.price;
    const displayDiscount = item.discount;
    const displayThumb = item.thumb;

    return (
      <div key={`${item.id}-${index}`} className="col-xl-3 col-lg-4 col-md-6 d-flex">
        <article className="home-shop-item valens-home-popular-card h-100 d-flex flex-column w-100">
          <div className="home-shop-thumb">
            <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
              <Image
                src={displayThumb}
                alt={displayTitle}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              {displayDiscount ? <span className="discount"> -{displayDiscount}%</span> : null}
            </Link>
            <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
          </div>
          <div className="home-shop-content d-flex flex-column flex-grow-1">
            <h4 className="title">
              <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                {displayTitle}
              </Link>
            </h4>
            <p className="valens-card-desc">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            {displayCategory ? (
              <div className="valens-card-tags">
                <span className="valens-card-tag">{displayCategory}</span>
              </div>
            ) : null}
            <div className="valens-card-price-row mt-auto">
              <span className="home-shop-price">
                {Number(displayPrice).toFixed(2).replace(".", ",")} €
              </span>
              <span className="valens-card-stock">
                {item.stock_status === "out_of_stock" ? "Jashtë stokut" : "Në stok"}
              </span>
            </div>
            <div className="shop-content-bottom">
              <button
                type="button"
                onClick={() => handleAddToCart(item)}
                className="cart"
                aria-label={`Shto ${displayTitle} në shportë`}
              >
                <i className="flaticon-shopping-cart-1"></i>
                <span>Shto në shportë</span>
              </button>
              <button
                type="button"
                onClick={() => handleBuyNow(item)}
                className="eg-btn btn-two"
                aria-label={`Blej ${displayTitle} tani`}
              >
                Blej tani
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  };

  return (
    <section id="products" className="home-shop-area valens-popular-area valens-home-popular">
      <div className="container">
        <div className="related-products-wrap">
          <div className="section-title mb-60 valens-popular-head">
            <h2 className="title">Produktet më të kërkuara</h2>
            <div className="valens-popular-all-wrap">
              <Link to="/produktet" className="valens-popular-all-btn">
                <span>Shiko te gjitha produktet</span>
                <i className="flaticon-right-arrow" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
          {isLoading && !products.length ? (
            <div className="container py-5 text-center">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : hasMounted ? (
            <Slider
              {...settings}
              className="row home-shop-active valens-popular-slider valens-shop-card-design"
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 3, arrows: true } },
                { breakpoint: 992, settings: { slidesToShow: 2, arrows: false } },
                { breakpoint: 576, settings: { slidesToShow: 1, arrows: false } },
              ]}
            >
              {products.map((item, index) => renderProductCard(item, index))}
            </Slider>
          ) : (
            <div className="row home-shop-active valens-popular-slider valens-shop-card-design">
              {products.slice(0, 4).map((item, index) => renderProductCard(item, index))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeOnePopularProducts;
