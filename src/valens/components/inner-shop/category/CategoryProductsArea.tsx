
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link, useNavigate } from "@tanstack/react-router";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { addToCart } from "@v/redux/features/cartSlice";

interface CategoryProductsAreaProps {
  products: any[];
  title?: string;
  enableCategoryFilter?: boolean;
}

const CategoryProductsArea = ({ products, title, enableCategoryFilter = false }: CategoryProductsAreaProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemsPerPage = 16;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");

  const capitalizeCategory = (category: string) =>
    category.charAt(0).toLocaleUpperCase("sq") + category.slice(1).toLocaleLowerCase("sq");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => String(product.valensSubtitle || "").trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "sq")),
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter(
            (product) => String(product.valensSubtitle || "").trim() === activeCategory,
          ),
    [activeCategory, products],
  );

  const handleAddToCart = (item: any) => {
    dispatch(addToCart(item));
  };

  const handleBuyNow = (item: any) => {
    dispatch(addToCart(item));
    void navigate({ to: "/cart" });
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, products]);

  useEffect(() => {
    if (activeCategory !== "all" && !categories.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [activeCategory, categories]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [currentPage, filteredProducts]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const visiblePages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

    return Array.from(visiblePages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  const renderPageItems = () => {
    if (totalPages <= 7) {
      return pageNumbers.map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={page === currentPage}
            className="valens-shop-pagination__page"
            onClick={(event) => {
              event.preventDefault();
              goToPage(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ));
    }

    const items: React.ReactNode[] = [];
    let previousPage = 0;

    pageNumbers.forEach((page) => {
      if (previousPage && page - previousPage > 1) {
        items.push(
          <PaginationItem key={`ellipsis-${page}`}>
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={page === currentPage}
            className="valens-shop-pagination__page"
            onClick={(event) => {
              event.preventDefault();
              goToPage(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>,
      );

      previousPage = page;
    });

    return items;
  };

  return (
    <section className="home-shop-area inner-home-shop valens-popular-area valens-shop-card-design">
      <div className="container">
        <div className="related-products-wrap">
          {title ? (
            <div className="section-title mb-40 valens-popular-head">
              <h2 className="title">{title}</h2>
            </div>
          ) : null}
          {enableCategoryFilter ? (
            <div className="valens-product-filter" aria-label="Filtro produktet sipas kategorisë">
              <div className="valens-product-filter__heading">
                <h1>Produktet</h1>
                <p>Zgjidh kategorinë që të përshtatet dhe gjej produktet që të nevojiten.</p>
              </div>
              <div className="valens-product-filter__options" role="group" aria-label="Kategoritë e produkteve">
                <button
                  type="button"
                  className={`valens-product-filter__button${activeCategory === "all" ? " is-active" : ""}`}
                  aria-pressed={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                >
                  Të gjitha
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`valens-product-filter__button${activeCategory === category ? " is-active" : ""}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {capitalizeCategory(category)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="row valens-shop-grid gx-5 gy-4">
            {currentProducts.map((item) => (
              <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 d-flex">
                <article className="home-shop-item valens-home-popular-card h-100 d-flex flex-column w-100">
                  <div className="home-shop-thumb">
                    <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                      <Image src={item.thumb} alt={item.title} />
                      {item.discount ? (
                        <span className="discount"> -{item.discount}%</span>
                      ) : null}
                    </Link>
                    <div className={`shop-thumb-shape ${item.class_name || ""}`}></div>
                  </div>
                  <div className="home-shop-content d-flex flex-column flex-grow-1">
                    <h4 className="title">
                      <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                        {item.title}
                      </Link>
                    </h4>
                    <p className="valens-card-desc">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    {item.valensSubtitle ? (
                      <div className="valens-card-tags">
                        <span className="valens-card-tag">{item.valensSubtitle}</span>
                      </div>
                    ) : null}
                    <div className="valens-card-price-row mt-auto">
                      <span className="home-shop-price">
                        {Number(item.price).toFixed(2).replace(".", ",")} €
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
                        aria-label={`Shto ${item.title} në shportë`}
                      >
                        <i className="flaticon-shopping-cart-1"></i>
                        <span>Shto në shportë</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBuyNow(item)}
                        className="eg-btn btn-two"
                        aria-label={`Blej ${item.title} tani`}
                      >
                        Blej tani
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
          {totalPages > 1 ? (
            <Pagination className="valens-shop-pagination mt-12">
              <PaginationContent className="valens-shop-pagination__content">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "valens-shop-pagination__control pointer-events-none"
                        : "valens-shop-pagination__control"
                    }
                  />
                </PaginationItem>
                {renderPageItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "valens-shop-pagination__control pointer-events-none"
                        : "valens-shop-pagination__control"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default CategoryProductsArea;
