// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { CategoryType } from "@v/data/CategoryData";

interface CategoryHeroProps {
  category: CategoryType;
}

const categoryImages: Record<string, string> = {
  zemra: "/assets/img/categories/heart.webp",
  imuniteti: "/assets/img/categories/imuniteti.webp",
  gjumi: "/assets/img/categories/gjumi.webp",
  truri: "/assets/img/categories/brain.webp",
  femra: "/assets/img/categories/femra.webp",
  meshkuj: "/assets/img/categories/meshkuj.webp",
};

const categoryFeatures: Record<string, string[]> = {
  zemra: [
    "Mbështetje për zemrën dhe qarkullimin",
    "Nivele të balancuara të kolesterolit",
    "Energji dhe qëndrueshmëri më e mirë",
  ],
  imuniteti: [
    "Sistem imunitar më i fortë",
    "Mbrojtje kundër sëmundjeve sezonale",
    "Mbështetje për energji dhe vitalitet",
  ],
  gjumi: [
    "Gjumë më i thellë dhe i qetë",
    "Reduktim i stresit dhe ankthit",
    "Sistem imunitar më i fortë",
  ],
  truri: [
    "Përmirësim i fokusit dhe koncentrimit",
    "Mbështetje për kujtesën",
    "Performancë më e lartë mendore",
  ],
  femra: [
    "Balancim hormonal",
    "Mbështetje për lëkurë, flokë dhe thonj",
    "Energji dhe mirëqenie e përditshme",
  ],
  meshkuj: [
    "Rritje e energjisë dhe performancës",
    "Mbështetje për shëndetin hormonal",
    "Vitalitet dhe qëndrueshmëri",
  ],
};

const categoryDescriptions: Record<string, string> = {
  zemra:
    "Mbështet shëndetin e zemrës dhe qarkullimin e gjakut me formula të avancuara që ndihmojnë në ruajtjen e niveleve të shëndetshme të kolesterolit dhe energjisë kardiovaskulare. Këto produkte janë të dizajnuara për të forcuar funksionin e zemrës dhe për të kontribuar në një jetë më aktive dhe të qëndrueshme.",
  imuniteti:
    "Forco sistemin imunitar dhe mbro trupin çdo ditë me përbërës të fuqishëm të mbështetur shkencërisht. Kjo kategori ndihmon në rritjen e rezistencës ndaj infeksioneve dhe mirëmbajtjen e shëndetit të përgjithshëm.",
  gjumi:
    "Përmirëso cilësinë e gjumit dhe rikuperimin natyral të trupit. Formulat ndihmojnë në relaksim, reduktim të stresit dhe një gjumë më të thellë e më të qetë pa ndikuar negativisht në energjinë e ditës.",
  truri:
    "Forco sistemin imunitar dhe mbro trupin çdo ditë me përbërës të fuqishëm të mbështetur shkencërisht. Kjo kategori ndihmon në rritjen e rezistencës ndaj infeksioneve dhe mirëmbajtjen e shëndetit të përgjithshëm.",
  femra:
    "Produkte të dizajnuara për të mbështetur shëndetin hormonal, bukurinë dhe mirëqenien e përgjithshme të femrave në çdo fazë të jetës.",
  meshkuj:
    "Formula të fuqishme për energji, performancë dhe shëndet të përgjithshëm mashkullor. Mbështesin vitalitetin, forcën dhe funksionet kryesore të organizmit.",
};

const CategoryHero = ({ category }: CategoryHeroProps) => {
  const imgSrc = categoryImages[category.slug] || "/assets/img/categories/default.png";
  const features = categoryFeatures[category.slug] || [];
  const description = categoryDescriptions[category.slug] || category.tagline;

  return (
    <section className="category-hero-area">
      <div className="container">
        <div className="category-hero-img-wrap">
          <Image
            src={imgSrc}
            alt={category.name}
            width={540}
            height={340}
            className="category-hero-img"
            priority
          />
        </div>
        <div
          className="category-hero-features-marquee d-block d-sm-none"
          aria-label={`${category.name} benefits`}
        >
          <div className="category-hero-features-track">
            <ul className="category-hero-features category-hero-features--marquee" aria-hidden="true">
              {features.map((f, i) => (
                <li key={`marquee-a-${i}`} className="category-hero-feature">
                  {f}
                </li>
              ))}
            </ul>
            <ul className="category-hero-features category-hero-features--marquee" aria-hidden="true">
              {features.map((f, i) => (
                <li key={`marquee-b-${i}`} className="category-hero-feature">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="category-hero-features category-hero-features--default d-none d-sm-flex">
          {features.map((f, i) => (
            <li key={i} className="category-hero-feature">
              {f}
            </li>
          ))}
        </ul>
        <div className="category-hero-content">
        <h2 className="category-hero-title">{category.name}</h2>
        <p className="category-hero-desc">{description}</p>
        </div>
      </div>
    </section>
  );
};

export default CategoryHero;
