// @ts-nocheck
export const animationCreate = () => {
  if (typeof window === "undefined") return;
  try {
    const WOW = require("wowjs");
    new WOW.WOW({ live: false }).init();
  } catch {}
};
