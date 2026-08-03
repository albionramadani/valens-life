
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { addToCart } from "@v/redux/features/cartSlice";

interface CategoryProductsAreaProps {
  products: any[];
  title?: string;
}

const CategoryProductsArea = ({ products, title }: CategoryProductsAreaProps) => {
  const dispatch = useDispatch();
  const itemsPerPage = 16;
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddToCart = (item: any) => {
    dispatch(addToCart(item));
  };

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [currentPage, products]);

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
                    {item.valensSubtitle ? (
                      <span className="valens-popular-category">{item.valensSubtitle}</span>
                    ) : null}
                    <h4 className="title">
                      <Link to="/shop-details/$id" params={{ id: String(item.id) }}>
                        {item.title}
                      </Link>
                    </h4>
                    <p className="valens-popular-subtitle">Lorem Ipsum</p>
                    <span className="home-shop-price">
                      {Number(item.price).toFixed(2).replace(".", ",")} €
                    </span>
                    <div className="shop-content-bottom mt-auto">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="cart"
                        aria-label={`Shto ${item.title} në shportë`}
                      >
                        <i className="flaticon-shopping-cart-1"></i>
                        <span>Shto në shportë</span>
                      </button>
                      <Link to="/shop-details/$id" params={{ id: String(item.id) }} className="eg-btn btn-two">
                        Blej tani
                      </Link>
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
