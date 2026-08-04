import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";
import SocialIcon from "@v/components/common/SocialIcon";

const ContactPage = () => {
  return (
    <>
      <HeaderOne style={true} />
      <main className="main-area fix valens-no-breadcrumb-page">
        <section className="valens-contact-area">
          <div className="container">
            <div className="section-title text-center mb-40">
              <h2 className="title">Na kontakto</h2>
              <p className="valens-category-subtitle">
                Ke pyetje apo ke nevojë për ndihmë në zgjedhjen e produktit të
                duhur? Na shkruaj ose na telefono, jemi këtu për ty.
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6">
                <div className="footer-widget">
                  <h4 className="fw-title">NA KONTAKTONI</h4>
                  <div className="footer-contact-wrap">
                    <p>
                      Prishtinë , 10000
                      <br />
                      Icon Tower Rr. Tirana
                    </p>
                    <ul className="list-wrap">
                      <li className="phone">
                        <i className="fas fa-phone"></i> +383 100 100
                      </li>
                      <li className="mail">
                        <i className="fas fa-envelope"></i> info@valens.com
                      </li>
                      <li className="website">
                        <i className="fas fa-globe"></i> www.valens.com
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="footer-widget">
                  <h4 className="fw-title">NA NDIQ</h4>
                  <div className="footer-social">
                    <SocialIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterOne style={true} />
    </>
  );
};

export default ContactPage;
