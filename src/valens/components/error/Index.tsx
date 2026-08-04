// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router"
const valensLogo = "/assets/img/logo/Isolation_Mode.svg";
const Error = () => {
   return (
      <main>
         <div className="error-page-logo">
            <Link to="/" aria-label="Shko në faqen kryesore">
               <Image src={valensLogo} alt="Valens" priority />
            </Link>
         </div>

         <section className="eg-error__area">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-xxl-8 col-xl-9 col-lg-10">
                     <div className="eg-error__content text-center">
                        <span className="eg-error__kicker">Gabim 404</span>
                        <h1 className="eg-error__title">Faqja nuk u gjet</h1>
                        <p>Na vjen keq, faqja që po kërkoni nuk ekziston ose është zhvendosur.</p>
                        <div className="eg-error__actions">
                           <Link className="eg-btn btn-two" to="/">Kthehu në kryefaqe</Link>
                           <Link className="eg-btn btn-two" to="/produktet">Shiko produktet</Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </main>
   )
}

export default Error
