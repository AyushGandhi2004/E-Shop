import {create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
    id : string;
    title : string;
    price : number;
    image : string[];
    quantity? : number;
    shopId : string;
}

type Store = {
    cart : Product[];
    wishlist : Product[];
    addToCart : (
        product : Product,
        user : any,
        location : string,
        deviceInfo : string
    ) => void;

    removeFromCart : (
        id : string,
        user : any,
        location : string,
        deviceInfo : string
    ) => void;

    addToWishlist : (
        product : Product,
        user : any,
        location : string,
        deviceInfo : string
    ) => void;

    removeFromWishlist : (
        id : string,
        user : any,
        location : string,
        deviceInfo : string
    ) => void;
}

export const useStore = create<Store>()(
    persist(
        (set,get)=>({
            cart : [],
            wishlist : [],

            //Add to Cart:
            addToCart : (product, user, location, deviceInfo) => {
                set((state)=>{
                    const existingProduct = state.cart.find((item)=>item.id === product.id);
                    if(existingProduct){
                        return {
                            cart : state.cart.map((item)=>item.id === product.id ? {...item, quantity : (item.quantity || 1) + 1} : item)
                        }
                    }
                    return {
                        cart : [...state.cart, {...product, quantity : 1}]
                    }
                })
            },

            removeFromCart : (id, user, location, deviceInfo) => {
                const existingProduct = get().cart.find((item)=>item.id === id);
                set((state)=>{
                    return {
                        cart : state.cart.filter((item)=>item.id !== id)
                    }
                });

            },

            //Wishlist:
            addToWishlist : (product, user, location, deviceInfo) => {
                set((state)=>{
                    const existingProduct = state.wishlist.find((item)=>item.id === product.id);
                    if(existingProduct){
                        return state;
                    }
                    return {
                        wishlist : [...state.wishlist, product]
                    }
                })
            },

            removeFromWishlist : (id, user, location, deviceInfo) => {
                const existingProduct = get().wishlist.find((item)=>item.id === id);
                set((state)=>{
                    return {
                        wishlist : state.wishlist.filter((item)=>item.id !== id)
                    }
                })
            }

        }), {name : "store-storage"}
    )
)