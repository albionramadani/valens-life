// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
const valensWordmark = "/assets/img/logo/valens.svg";
const HomeOneAboutValens = () => {
  return (
    <section
      id="about"
      className="valens-about-area"
      style={{ backgroundImage: `url(/assets/img/bg/about-bg.png)` }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 offset-lg-1 col-md-10">
            <div className="valens-about-text">
              <h2 className="valens-about-heading">
                <Image
                  src={valensWordmark}
                  alt="Valens"
                  className="valens-about-logo"
                />
              </h2>
              <div className="valens-about-content">
                <p>
                  Ne besojmë se një jetë e shëndetshme fillon me zgjedhjet e
                  duhura. Misioni ynë është t’ju ofrojmë produkte të përzgjedhura
                  me kujdes që mbështesin energjinë, imunitetin dhe mirëqenien
                  tuaj të përditshme.
                </p>
                <p>
                  Me fokus në cilësi dhe rezultate reale, synojmë të jemi partneri
                  juaj i besueshëm në rrugëtimin drejt një stili jetese më të
                  shëndetshëm.
                </p>
                <p>
                  Për këtë arsye, ne sjellim produkte nga brandi lider Life
                  Extension, i njohur globalisht për formulat e avancuara dhe
                  përbërësit e mbështetur në shkencë.
                </p>
                <p>
                  Duke zgjedhur Life Extension, ju zgjidhni standard të lartë,
                  inovacion dhe përkushtim ndaj shëndetit afatgjatë.
                </p>
              </div>
            </div>
          </div>
       
        </div>
      </div>
    </section>
  );
};

export default HomeOneAboutValens;
