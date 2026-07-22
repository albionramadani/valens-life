

import { toast } from "react-toastify";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setLocalStorage, getLocalStorage } from "@v/utils/localstorage";


interface Product {
  id: string;
  title: string;
  quantity: number;
  // Add other properties here if needed
}
interface CartState {
  cart: Product[];
  orderQuantity: number,
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
      setLocalStorage("cart", state.cart);
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
      setLocalStorage("cart", state.cart);
    },
    remove_cart_product: (state, { payload }: PayloadAction<Product>) => {
      state.cart = state.cart.filter((item) => item.id !== payload.id);
      toast.error(`Remove from your cart`, {
        position: "top-right",
      });
      setLocalStorage("cart", state.cart);
    },
    clear_cart: (state) => {
      const confirmMsg = window.confirm("Are you sure you want to delete your bag?");
      if (confirmMsg) {
        state.cart = [];
      }
      setLocalStorage("cart", state.cart);
    },
    get_cart_products: (state) => {
      state.cart = getLocalStorage<Product>("cart");
    },
    quantityDecrement: (state, { payload }: PayloadAction<Product>) => {
      state.cart = state.cart.map((item) => {
        if (item.id === payload.id && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      setLocalStorage("cart", state.cart);
    },
  },
});

export const {
  addToCart,
  decrease_quantity,
  remove_cart_product,
  clear_cart,
  get_cart_products,
  quantityDecrement,
  increment, 
  decrement,
} = cartSlice.actions;

export default cartSlice.reducer;


