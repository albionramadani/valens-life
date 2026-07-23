"use client"
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import UseSticky from "../../hooks/UseSticky";
// next/image shim: use plain img
const Image = (p: any) => { const { src, alt = "", width, height, fill, priority, loader, placeholder, blurDataURL, quality, sizes, ...rest } = p; const s = typeof src === "string" ? src : src?.src ?? ""; return <img src={s} alt={alt} width={width} height={height} {...rest} />; };
import NavMenuOne from "./Menu/NavMenuOne";
import Sidebar from "./Menu/Sidebar";
import HeaderCart from "./Menu/HeaderCart";

const valensLogo = "/assets/img/logo/Isolation_Mode.svg";
type HeaderOneProps = {
    style: any;
    hideNavLinks?: boolean;
};

const HeaderOne = ({ style, hideNavLinks = false }: HeaderOneProps) => {
    const { sticky } = UseSticky();
    const [isActive, setIsActive] = useState<boolean>(false);
    const [cartOpen, setCartOpen] = useState<boolean>(false)
    const productItem = useSelector((state: any) => state.cart.cart);
    const pathname = useLocation({ select: (location) => location.pathname });
    const isHome = pathname === "/";
    const shouldHideNavLinks = hideNavLinks || !isHome;
    const handleCartToggle = () => setCartOpen((prev) => !prev);

    return (
        <>
            <header id="home">
                <div
                    id="sticky-header"
                    className={`menu-area ${style ? "transparent-header" : ""} ${sticky ? "sticky-menu" : ""} ${shouldHideNavLinks ? "valens-header-on-white" : ""}`}
                >
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="menu-wrap">
                                    <nav className="menu-nav">
                                        <div className="logo">
                                            <Link to="/">
                                                <Image src={valensLogo} alt="Valens" className="valens-header-logo" priority />
                                            </Link>
                                        </div>
                                        {!shouldHideNavLinks ? (
                                            <div className="mobile-header-actions d-flex d-xl-none align-items-center">
                                                <div className="header-shop-cart mobile-header-cart">
                                                    <a style={{ cursor: "pointer" }} onClick={handleCartToggle} className="cart-count" aria-label="Toggle cart">
                                                        <i className="flaticon-shopping-cart"></i>
                                                        <span className="mini-cart-count">{productItem.length}</span>
                                                    </a>
                                                    <HeaderCart cartOpen={cartOpen} setCartOpen={setCartOpen} />
                                                </div>
                                                <div onClick={() => setIsActive(true)} className="mobile-nav-toggler" aria-label="Open menu">
                                                    <i className="flaticon-layout"></i>
                                                </div>
                                            </div>
                                        ) : null}
                                        {!shouldHideNavLinks ? (
                                            <div className="navbar-wrap main-menu d-none d-xl-flex justify-content-center">
                                                <NavMenuOne /> 
                                            </div>
                                        ) : null}
                                        <div className={`header-action ${shouldHideNavLinks ? 'd-block ms-auto' : 'd-none d-xl-block'}`}>
                                            <ul>
                                                <li className="header-shop-cart">
                                                    <a style={{ cursor: "pointer" }} onClick={handleCartToggle} className="cart-count"><i className="flaticon-shopping-cart"></i>
                                                        <span className="mini-cart-count">{productItem.length}</span>
                                                    </a>
                                                    <HeaderCart cartOpen={cartOpen} setCartOpen={setCartOpen} />
                                                </li>
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
                {!shouldHideNavLinks ? <Sidebar style={!isHome} isActive={isActive} setIsActive={setIsActive} /> : null}
        </>
    );
}

export default HeaderOne
