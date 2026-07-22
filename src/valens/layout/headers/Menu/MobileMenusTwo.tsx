"use client";
import { useLocation } from "@tanstack/react-router";
import React, { useState } from "react";
// internal
import menu_data from "../../../data/MenuData";

const MobileMenusTwo = ({setIsActive}:any) => {
    const [navTitle, setNavTitle] = useState("");
    const currentRoute = useLocation({ select: (location) => location.pathname });

    const isMenuItemActive = (menuLink: any) => {
        return currentRoute === menuLink;
    };

    const isSubMenuItemActive = (subMenuLink: any) => {
        return currentRoute === subMenuLink;
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
            {menu_data.filter((item: any) => item.page === "header_2").map((menu, i) => (
                <React.Fragment key={i}>
                    {menu.has_dropdown && (
                        <li className="menu-item-has-children">
                            <a href={menu.link}
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
                            <a href={menu.link} className={`${currentRoute === menu.link ? "active" : ""}`}>
                                {menu.title}
                            </a>
                        </li>
                    )}
                </React.Fragment>
            ))}
        </ul>
    );
}

export default MobileMenusTwo;