import { toast } from "react-toastify";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Cart persistence stores ONLY a fingerprint in localStorage: product id + quantity.
// Prices, titles and images are NEVER written to storage — they are looked up fresh
// from the product catalogue when the cart is rehydrated on load (see Wrapper.tsx).
const CART_STORAGE_KEY = "vlx_b";

interface Product {
  id: string;
  title?: string;
  quantity: number;
  // Full product fields (price, thumb, …) live only in memory.
  [key: string]: any;
}

const saveFingerprint = (cart: Product[]) => {
  if (typeof window === "undefined") return;
  try {
    const fp = cart.map((i) => ({ id: i.id, quantity: i.quantity }));
    if (fp.length) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(fp));
    else window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore quota / private-mode errors.
  }
};

// Read the persisted fingerprint (id + quantity only). Consumed by the rehydrator,
// which enriches each entry with live catalogue data.
export const readCartFingerprint = (): { id: string; quantity: number }[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((x) => x && typeof x.id === "string")
          .map((x) => ({ id: x.id, quantity: Math.max(1, Number(x.quantity) || 1) }))
      : [];
  } catch {
    return [];
  }
};

interface CartState {
  cart: Product[];
  orderQuantity: number;
}
const initialState: CartState = {
  cart: [],
  orderQuantity: 1,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, { payload }: PayloadAction<Product>) => {
      const productIndex = state.cart.findIndex((item) => item.id === payload.id);
      if (productIndex >= 0) {
        state.cart[productIndex].quantity += 1;
        toast.info(`${payload.title} Increase Product Quantity`, {
          position: "top-right",
        });
      } else {
        const tempProduct = { ...payload, quantity: 1 };
        state.cart.push(tempProduct);
        toast.success(`${payload.title} added to cart`, {
          position: "top-right",
        });
      }
      saveFingerprint(state.cart);
    },
    //
    increment: (state, { payload }) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state, { payload }) => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    //

    decrease_quantity: (state, { payload }: PayloadAction<Product>) => {
      const cartIndex = state.cart.findIndex((item) => item.id === payload.id);
      if (state.cart[cartIndex].quantity > 1) {
        state.cart[cartIndex].quantity -= 1;
        toast.error(`${payload.title} Decrease cart quantity`, {
          position: "top-right",
        });
      }
      saveFingerprint(state.cart);
    },
    remove_cart_product: (state, { payload }: PayloadAction<Product>) => {
      state.cart = state.cart.filter((item) => item.id !== payload.id);
      toast.error(`Remove from your cart`, {
        position: "top-right",
      });
      saveFingerprint(state.cart);
    },
    clear_cart: (state) => {
      state.cart = [];
      saveFingerprint(state.cart);
    },
    // Rebuild the in-memory cart from fingerprint entries already enriched with
    // catalogue data (title/price/thumb). Called once on load from Wrapper.
    hydrate_cart: (state, { payload }: PayloadAction<Product[]>) => {
      state.cart = payload;
      saveFingerprint(state.cart);
    },
    // Deprecated no-op: rehydration now happens via hydrate_cart in Wrapper.
    get_cart_products: () => {},
    quantityDecrement: (state, { payload }: PayloadAction<Product>) => {
      state.cart = state.cart.map((item) => {
        if (item.id === payload.id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      saveFingerprint(state.cart);
    },
  },
});

export const {
  addToCart,
  decrease_quantity,
  remove_cart_product,
  clear_cart,
  get_cart_products,
  hydrate_cart,
  quantityDecrement,
  increment,
  decrement,
} = cartSlice.actions;

export default cartSlice.reducer;
