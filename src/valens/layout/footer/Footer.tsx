// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import SocialIcon from "@v/components/common/SocialIcon";

const footer_logo = "/assets/img/logo/Isolation_Mode.svg";
interface DataType {
   id: number;
   class_name: string;
   title: string;
   footer_link: {
      link: string;
      link_title: string;
   }[]
}

const footer_data: DataType[] = [
   {
      id: 1,
      class_name: "col-lg-3",
      title: "Rreth Nesh",
      footer_link: [
         { link: "/", link_title: "Ballina" },
         { link: "/kategorite", link_title: "Kategorite" },
         { link: "/rreth-nesh", link_title: "Rreth Nesh" },
         { link: "/produktet", link_title: "Produktet" },
         { link: "/pyetje", link_title: "Pyetje" },
      ]
   },
   // {
   //    id: 2,
   //    class_name: "col-lg-2",
   //    title: "Ndihme",
   //    footer_link: [
   //       { link: "/#faq", link_title: "Pyetje" },
   //       { link: "/#about", link_title: "Ekipi" },
   //       // { link: "/#contact", link_title: "Kontakti" },
   //       { link: "/feature", link_title: "Blog" },
   //    ]
   // },
]

const FooterOne = ({style}:any) => {
   return (
      <footer id="contact" className="footer-area valens-footer not-show-instagram">
         <div className="footer-top-wrap">
            <div className="container">
               <div className="footer-widgets-wrap">
                  <div className="row justify-content-between">
                     <div className="col-lg-4 col-md-7">
                        <div className="footer-widget">
                           <div className="footer-about">
                              <div className="footer-logo logo">
                                 <Link to="/"><Image src={footer_logo} alt="Logo" /></Link>
                              </div>
                              <div className="footer-text">
                                 <p>Ne besojmë se një jetë e shëndetshme fillon me zgjedhjet e duhura</p>
                              </div>
                              <div className="footer-social">
                                 <SocialIcon />
                              </div>
                           </div>
                        </div>
                     </div>

                     {footer_data.map((item) => (
                        <div key={item.id} className={` ${item.class_name} col-md-5 col-sm-6`}>
                           <div className="footer-widget">
                              <h4 className="fw-title">{item.title}</h4>
                              <ul className="list-wrap">
                                 {item.footer_link.map((li, i) => (
                                    <li key={i}><Link to={li.link}>{li.link_title}</Link></li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                     ))}

                     <div className="col-lg-3 col-md-5">
                        <div className="footer-widget">
                           <h4 className="fw-title">NA KONTAKTONI</h4>
                           <div className="footer-contact-wrap">
                              <p>Rr. Gjilani, Nr. 204, Çagllavicë, 10000 Prishtinë, Kosovë</p>
                              <ul className="list-wrap">
                                 <li className="phone"><i className="fas fa-phone"></i> +383 100 100</li>
                                 <li className="mail"><i className="fas fa-envelope"></i> info@valens.life</li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
      </footer>
   )
}

export default FooterOne
