import type { FormEvent } from "react";
import HeaderOne from "@v/layout/headers/HeaderOne";
import FooterOne from "@v/layout/footer/Footer";

const ContactPage = () => {
  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") || "Mesazh nga faqja Valens");
    const body = `Emri: ${form.get("name")}\nEmail: ${form.get("email")}\n\n${form.get("message")}`;
    window.location.href = `mailto:info@valens.life?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <HeaderOne style={true} />
      <main className="main-area fix valens-contact-page">
        <section className="valens-contact-area">
          <span className="valens-contact-leaves valens-contact-leaves--left" aria-hidden="true" />
          <span className="valens-contact-leaves valens-contact-leaves--right" aria-hidden="true" />
          <div className="container">
            <header className="valens-contact-head">
              <h1>Na kontakto</h1>
              <p>Jemi këtu për ty! Na shkruaj ose na kontakto direkt për çdo pyetje, kërkesë apo bashkëpunim.</p>
            </header>

            <div className="valens-contact-grid">
              <div className="valens-contact-left">
                <a className="valens-contact-info-card" href="tel:+383100100">
                  <span className="valens-contact-round-icon"><i className="fas fa-phone" /></span>
                  <span><strong>Na telefono</strong><small>+383 100 100</small></span>
                </a>
                <a className="valens-contact-info-card" href="mailto:info@valens.life">
                  <span className="valens-contact-round-icon"><i className="far fa-envelope" /></span>
                  <span><strong>Na shkruaj</strong><small>info@valens.life</small></span>
                </a>

                <div className="valens-contact-social-card">
                  <h2 className="">Na ndiqni në rrjetet sociale</h2>
                  <div className="valens-contact-social-grid">
                    <a href="https://www.facebook.com/valenslifee" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook-f valens-facebook" /><strong>Facebook</strong>
                    </a>
                    <a href="https://www.instagram.com/valens.ks" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-instagram valens-instagram" /><strong>Instagram</strong>
                    </a>
                    <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-tiktok valens-tiktok" /><strong>TikTok</strong>
                    </a>
                  </div>
                </div>
              </div>

              <form className="valens-contact-form" onSubmit={sendMessage}>
                <div className="valens-contact-form-head">
                  <span className="valens-contact-round-icon"><i className="far fa-paper-plane" /></span>
                  <span><h2>Dërgo mesazhin</h2><p>Plotëso formularin dhe do t'ju përgjigjemi së shpejti.</p></span>
                </div>
                <div className="valens-contact-form-row">
                  <input name="name" type="text" placeholder="Emri dhe mbiemri" aria-label="Emri dhe mbiemri" required />
                  <input name="email" type="email" placeholder="Email" aria-label="Email" required />
                </div>
                <input name="subject" type="text" placeholder="Subjekti" aria-label="Subjekti" required />
                <textarea name="message" placeholder="Mesazhi" aria-label="Mesazhi" required />
                <button type="submit">Dërgo mesazhin</button>
              </form>
            </div>
          </div>

          {/* <div className="valens-contact-benefits">
            <div className="container valens-contact-benefits-grid">
              <div><span><i className="fas fa-headset" /></span><p><strong>Mbështetje e shpejtë</strong>Na kontaktoni për ndihmë me porositë, produktet apo çdo pyetje tjetër.</p></div>
              <div><span><i className="fas fa-box-open" /></span><p><strong>Porosi &amp; dërgesa</strong>Pyetje rreth porosive, dërgesave apo kthimeve? Jemi këtu për ju.</p></div>
              <div><span><i className="far fa-handshake" /></span><p><strong>Bashkëpunime</strong>Për propozime bashkëpunimi apo partneritete, na shkruani lirshëm.</p></div>
            </div>
          </div> */}
        </section>
      </main>
      <FooterOne style={true} />
    </>
  );
};

export default ContactPage;
