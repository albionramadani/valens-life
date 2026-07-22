// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import { categories } from "@v/data/CategoryData";

const categoryIconSrcBySlug: Record<string, string> = {
  zemra: "/assets/img/icons/zemra.svg",
  imuniteti: "/assets/img/icons/Imuniteti.svg",
  gjumi: "/assets/img/icons/Gjumi.svg",
  truri: "/assets/img/icons/Truri.svg",
  femra: "/assets/img/icons/Femra.svg",
  meshkuj: "/assets/img/icons/Meshkuj.svg",
};

const HomeOneCategories = () => {
  return (
    <section id="categories" className="valens-category-area">
      <div className="container">
        <div className="section-title text-center">
          <h2 className="title">Zgjidh sipas nevojës tënde</h2>
          <p className="valens-category-subtitle">
            Zgjedh kategorinë që i përshtatet nevojave tua dhe gjej produktet e
            duhura për ty.
          </p>
        </div>
        <div className="row justify-content-center">
          {categories.map((category) => (
            <div
              key={category.id}
              className="col-xl-4 col-md-6 col-sm-10 valens-category-col"
            >
              <Link
                to={`/kategoria/${category.slug}`}
                className="valens-category-card"
              >
                <div className="valens-category-inner">
                  <div className="valens-category-icon">
                    {categoryIconSrcBySlug[category.slug] ? (
                      <Image
                        src={categoryIconSrcBySlug[category.slug]}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="valens-category-icon-img"
                      />
                    ) : null}
                  </div>
                  <div className="valens-category-content">
                    <h4 className="valens-category-title">{category.name}</h4>
                    <p className="valens-category-text">{category.tagline}</p>
                  </div>
                  {/* <div className="valens-category-link">
                    <span>Më shumë</span>
                    <i className="fas fa-arrow-right"></i>
                  </div> */}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeOneCategories;
