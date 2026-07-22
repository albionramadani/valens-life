"use client";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import menu_data from "../../../data/MenuData";

const NavMenuOne = ({ num = false }) => {
    const currentRoute = useLocation({ select: (location) => location.pathname });
    const router = useNavigate();
    const [activeSection, setActiveSection] = useState<string>("home");

    const sectionIds = useMemo(() => ["categories", "products", "about", "faq", "contact"], []);
    const sectionStateRef = useRef<Record<string, { isIntersecting: boolean; ratio: number; top: number }>>({});

    useEffect(() => {
        if (currentRoute !== "/") {
            setActiveSection("home");
            return;
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

            if (!candidates.length) {
                if (window.scrollY < 80) setActiveSection("home");
                return;
            }

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

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    };

    const isMenuItemActive = (menuLink: string) => {
        if (menuLink === "/") {
            return currentRoute === "/" && activeSection === "home";
        }

        if (menuLink.startsWith("/#")) {
            const id = menuLink.replace("/#", "");
            return currentRoute === "/" && activeSection === id;
        }

        return currentRoute === menuLink;
    };

    const isSubMenuItemActive = (subMenuLink: string) => {
        return currentRoute === subMenuLink;
    };

    return (
            <ul className="navigation">
                {menu_data.filter((item: any) => item.page === "header_1").map((menu: any) => (
                    <li key={menu.id}
                        className={menu.has_dropdown ? "menu-item-has-children" : ""}
                    >
                        <a
                            href={menu.link}
                            onClick={(e) => {
                                if (!menu.link?.startsWith("/#")) return;

                                e.preventDefault();
                                const id = menu.link.replace("/#", "");

                                router(menu.link);
                                setActiveSection(id);

                                if (currentRoute === "/") {
                                    scrollToSection(id);
                                }
                            }}
                            className={`section-link ${(isMenuItemActive(menu.link) || (menu.sub_menus && menu.sub_menus.some((sub_m: any) => sub_m.link && isSubMenuItemActive(sub_m.link)))) ? "active" : ""}`}
                        >
                            {num && menu.id <= 9
                                ? `0${menu.id}.`
                                : num && `${menu.id}.`}
                            {menu.title}
                        </a>

                        {menu.has_dropdown && (
                            <>
                                {menu.sub_menus && (
                                    <ul className="sub-menu">
                                        {menu.sub_menus.map((sub_m: any, i: any) => (
                                            <li key={i} className={`dropdown_item-${sub_m.class_name}`}>
                                                <a
                                                    href={sub_m.link}
                                                    className={
                                                        sub_m.link && isSubMenuItemActive(sub_m.link) ? "active" : ""}>
                                                    {sub_m.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
    );
};

export default NavMenuOne;