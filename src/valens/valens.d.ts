// @ts-nocheck
declare module "react-modal-video";
declare module "wowjs";

declare global {
  interface Window {
    WOW?: any;
    bootstrap?: any;
  }
  namespace JSX {
    interface Element {
      type: any;
      props: any;
      key: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
export {};
