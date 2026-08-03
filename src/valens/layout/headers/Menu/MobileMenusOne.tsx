"use client";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
// internal
import menu_data from "../../../data/MenuData";

const MobileMenusOne = ({ setIsActive }: any) => {
    const [navTitle, setNavTitle] = useState("");
    const currentRoute = useLocation({ select: (location) => location.pathname });
    const router = useNavigate();
    const [activeSection, setActiveSection] = useState<string>("home");
    const sectionIds = useMemo(() => ["categories",  "about","products", "faq", "contact"], []);
    const sectionStateRef = useRef<Record<string, { isIntersecting: boolean; ratio: number; top: number }>>({});

    useEffect(() => {
        if (currentRoute !== "/") {
            setActiveSection("home");
            return;
        }

        const hashId = window.location.hash.replace(/^#/, "");
        if (hashId === "home" || sectionIds.includes(hashId)) {
            setActiveSection(hashId);
        }

        const sections = sectionIds
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => Boolean(el));

        if (!sections.length) return;

        const pickActiveSection = () => {
            if (window.scrollY < 80) {
                setActiveSection("home");
                return;
            }

            const candidates = sectionIds
                .map((id) => ({ id, ...sectionStateRef.current[id] }))
                .filter((item) => item.isIntersecting);

            if (!candidates.length) return;

            candidates.sort((a, b) => {
                if (b.ratio !== a.ratio) return b.ratio - a.ratio;
                return a.top - b.top;
            });

            setActiveSection(candidates[0].id);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    sectionStateRef.current[entry.target.id] = {
                        isIntersecting: entry.isIntersecting,
                        ratio: entry.intersectionRatio,
                        top: entry.boundingClientRect.top,
                    };
                }

                pickActiveSection();
            },
            {
                threshold: [0, 0.15, 0.3, 0.45, 0.6],
                rootMargin: "-120px 0px -55% 0px",
            }
        );

        for (const section of sections) observer.observe(section);

        const onScroll = () => {
            if (window.scrollY < 80) setActiveSection("home");
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, [currentRoute, sectionIds]);

    const isMenuItemActive = (menuLink: any) => {
        if (menuLink === "/") {
            return currentRoute === "/" && activeSection === "home";
        }

        if (menuLink?.startsWith("/#")) {
            const id = menuLink.replace("/#", "");
            return currentRoute === "/" && activeSection === id;
        }

        return currentRoute === menuLink;
    };

    const isSubMenuItemActive = (subMenuLink: any) => {
        return currentRoute === subMenuLink;
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    };

    const handleMenuNavigation = (e: any, menuLink: string) => {
        if (menuLink?.startsWith("/#")) {
            e.preventDefault();
            const id = menuLink.replace("/#", "");

            router({ to: menuLink });
            setActiveSection(id);

            if (currentRoute === "/") {
                scrollToSection(id);
            }

            setIsActive(false);
            return;
        }

        // Internal route links -> SPA navigation to the dedicated page.
        if (menuLink?.startsWith("/")) {
            e.preventDefault();
            router({ to: menuLink });
        }

        setIsActive(false);
    };


    //openMobileMenu
    const openMobileMenu = (menu: any) => {
        if (navTitle === menu) {
            setNavTitle("");
        } else {
            setNavTitle(menu);
        }
    };

    return (
        <ul className="navigation">
            {menu_data.filter((item: any) => item.page === "header_1").map((menu, i) => (
                <React.Fragment key={i}>
                    {menu.has_dropdown && (
                        <li className="menu-item-has-children">
                            <a href={menu.link}
                                onClick={(e) => handleMenuNavigation(e, menu.link)}
                                className={` ${(isMenuItemActive(menu.link) || (menu.sub_menus && menu.sub_menus.some((sub_m) => sub_m.link && isSubMenuItemActive(sub_m.link)))) ? "active" : ""}`}>
                                {menu.title}
                            </a>
                            <div
                                className={`dropdown-btn ${navTitle === menu.title ? "open" : ""}`}
                                onClick={() => openMobileMenu(menu.title)} >
                                <i className={`${navTitle === menu.title ? "fas fa-angle-up" : "fas fa-angle-down"}`}></i>
                            </div>
                            {menu.sub_menus && menu.sub_menus.length > 0 && (
                                <ul className="sub-menu" style={{ display: navTitle === menu.title ? "block" : "none" }}>
                                    {menu.sub_menus.map((sub, index) => (
                                        <li key={index}>
                                            <a href={sub.link}
                                                onClick={(e) => handleMenuNavigation(e, sub.link)}
                                                className={sub.link && isSubMenuItemActive(sub.link) ? "active" : ""}>
                                                {sub.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    )}
                    {!menu.has_dropdown && (
                        <li className="menu-item-has-children">
                            <a href={menu.link} onClick={(e) => handleMenuNavigation(e, menu.link)} className={`${isMenuItemActive(menu.link) ? "active" : ""}`}>
                                {menu.title}
                            </a>
                        </li>
                    )}
                </React.Fragment>
            ))}
        </ul>
    );
}

export default MobileMenusOne;