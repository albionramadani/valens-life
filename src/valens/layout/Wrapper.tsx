"use client";

import { useEffect, useRef } from "react";
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { hydrate_cart, readCartFingerprint } from "@v/redux/features/cartSlice";
import { useStorefrontShopProducts } from "@/hooks/useStorefrontShopProducts";
import ScrollToTop from "@v/components/common/ScrollToTop";

// NOTE: Bootstrap's JS bundle is intentionally NOT imported. The UMD build calls
// require("@popperjs/core"), which throws in the SSR/rolldown runtime. No component
// uses Bootstrap's JS behaviours (no data-bs-* attributes) — dropdowns are CSS-hover,
// the FAQ/menu/cart are custom React — so only the Bootstrap CSS is needed.
// WOW.js (animationCreate) was also removed: nothing uses `wow` classes, and it
// caused forced reflows / main-thread work for no visual benefit.

const Wrapper = ({ children }: any) => {
    const dispatch = useDispatch();
    const { data: products = [] } = useStorefrontShopProducts();
    const cart = useSelector((state: any) => state.cart.cart);
    const hydratedRef = useRef(false);

    // Rehydrate the cart once, from the persisted fingerprint (id + quantity only),
    // enriching each entry with live catalogue data (title/price/thumb). Prices are
    // never read from storage — they always come from the current product list.
    useEffect(() => {
        if (hydratedRef.current) return;
        const fingerprint = readCartFingerprint();
        if (!fingerprint.length) { hydratedRef.current = true; return; }
        if (!products.length || cart.length) return; // wait for catalogue; don't clobber
        const byId = new Map(products.map((p: any) => [p.id, p]));
        const items = fingerprint
            .map((f) => {
                const product = byId.get(f.id);
                return product ? { ...product, quantity: f.quantity } : null;
            })
            .filter(Boolean);
        if (items.length) dispatch(hydrate_cart(items as any));
        hydratedRef.current = true;
    }, [products, cart.length, dispatch]);

    return <>
        {children}
        <ScrollToTop />
        <ToastContainer position="bottom-right" />
    </>;
}

export default Wrapper
