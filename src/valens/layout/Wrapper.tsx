"use client";

import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { useDispatch } from "react-redux";
import { get_cart_products } from "@v/redux/features/cartSlice";
import ScrollToTop from "@v/components/common/ScrollToTop";

// NOTE: Bootstrap's JS bundle is intentionally NOT imported. The UMD build calls
// require("@popperjs/core"), which throws in the SSR/rolldown runtime. No component
// uses Bootstrap's JS behaviours (no data-bs-* attributes) — dropdowns are CSS-hover,
// the FAQ/menu/cart are custom React — so only the Bootstrap CSS is needed.
// WOW.js (animationCreate) was also removed: nothing uses `wow` classes, and it
// caused forced reflows / main-thread work for no visual benefit.

const Wrapper = ({ children }: any) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(get_cart_products());;
    }, [dispatch]);

    return <>
        {children}
        <ScrollToTop />
        <ToastContainer position="bottom-right" />
    </>;
}

export default Wrapper
