"use client";

import { useEffect } from "react";
import { animationCreate } from "@v/utils/utils";
import { ToastContainer } from 'react-toastify';
import { useDispatch } from "react-redux";
import { get_cart_products } from "@v/redux/features/cartSlice";
import ScrollToTop from "@v/components/common/ScrollToTop";

if (typeof window !== "undefined") {
    import("bootstrap/dist/js/bootstrap" as any);
}

const Wrapper = ({ children }: any) => {
    useEffect(() => {
        // animation
        const timer = setTimeout(() => {
            animationCreate();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

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
