"use client";
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import { Link } from "@tanstack/react-router";
import MobileMenusOne from "./MobileMenusOne";

const valensLogo = "/assets/img/logo/Isolation_Mode.svg";
const Sidebar = ({ style, isActive, setIsActive }: any) => {

    return (
        <div className={` ${isActive ? "mobile-menu-visible" : ""}`}>
            <div className="mobile-menu">
                <nav className="menu-box">
                    <div onClick={() => setIsActive(false)} className="close-btn"><i className="fas fa-times"></i></div>
                    <div className="nav-logo">
                        <Link to="/"><Image src={valensLogo} alt="Valens" /></Link>
                    </div>
                    <div className="menu-outer">
                        <MobileMenusOne setIsActive={setIsActive} />
                    </div>
                    <div className="social-links">
                        <ul className="clearfix">
                            <li><Link to="#" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></Link></li>
                            <li><Link to="#" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></Link></li>
                            <li><Link to="#" aria-label="TikTok"><i className="fab fa-tiktok" aria-hidden="true"></i></Link></li>
                        </ul>
                    </div>
                </nav>
            </div>
            <div onClick={() => setIsActive(false)} className="menu-backdrop"></div>
        </div>
    )
}

export default Sidebar;