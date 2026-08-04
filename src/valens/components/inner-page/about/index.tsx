// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";

const partnerImage = "/assets/img/bg/Supplements.webp";

const aboutParagraphs = [
  "Ne besojmë se një jetë e shëndetshme fillon me zgjedhjet e duhura. Misioni ynë është t’ju ofrojmë produkte të përzgjedhura me kujdes që mbështesin energjinë, imunitetin dhe mirëqenien tuaj të përditshme.",
  "Me fokus në cilësi dhe rezultate reale, synojmë të jemi partneri juaj i besueshëm në rrugëtimin drejt një stili jetese më të shëndetshëm.",
  "Për këtë arsye, ne sjellim produkte nga brandi lider Life Extension, i njohur globalisht për formulat e avancuara dhe përbërësit e mbështetur në shkencë. Duke zgjedhur Life Extension, ju zgjidhni standard të lartë, inovacion dhe përkushtim ndaj shëndetit afatgjatë.",
];

const valueCards = [
  { title: "Origjinalitet", text: "Produkte origjinale, të siguruara përmes kanaleve zyrtare të furnizimit." },
  { title: "Shkencë", text: "Formula dhe përbërës të mbështetur në kërkime dhe standarde bashkëkohore." },
  { title: "Qartësi", text: "Informacion i thjeshtë dhe i saktë për përbërjen dhe përdorimin e produktit." },
  { title: "Përgjegjësi", text: "Kujdes në çdo hap, nga përzgjedhja e produkteve deri te informacioni që ju ofrojmë." },
];

const AboutContent = () => {
  return (
    <section className="valens-rreth-area">
      <div className="container">
        <div className="valens-rreth-head">
          <h1 className="valens-rreth-title">Rreth nesh</h1>
          
        </div>

        <div className="valens-rreth-intro">
          {aboutParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="row valens-rreth-values gx-0 gy-4">
          {valueCards.map((card, index) => (
            <div key={index} className="col-lg-3 col-sm-6">
              <div className="valens-rreth-card">
                <h4 className="valens-rreth-card-title">{card.title}</h4>
                <p className="valens-rreth-card-text">{card.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="valens-rreth-partner">
          <div className="valens-rreth-partner-content">
            <span className="valens-rreth-partner-eyebrow">PARTNERI YNË</span>
            <h3 className="valens-rreth-partner-title">Life Extension</h3>
            <p className="valens-rreth-partner-text">
              Mbi katër dekada përvojë, formula të mbështetura në shkencë dhe
              kontroll i cilësisë për çdo seri prodhimi.
            </p>
            <Link to="/produktet" className="eg-btn valens-rreth-partner-btn">
              Shiko produktet
            </Link>
          </div>
          <div className="valens-rreth-partner-visual" aria-hidden="true">
            <Image
              src={partnerImage}
              alt="Life Extension"
              className="valens-rreth-partner-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutContent;
