import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './features/cartSlice'

const store = configureStore({
   reducer: {
      cart: cartSlice,
   },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false
   }),
})

export default store;