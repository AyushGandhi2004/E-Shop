"use client";
import { Heart, Search, ShoppingCart, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import HearderBottom from './HearderBottom'
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';

const Header = () => {
    const { user, isLoading } = useUser();
    const wishlist = useStore((state : any)=>state.wishlist);
    const cart = useStore((state : any)=>state.cart);
    // console.log(user)

    return (
        <div className='w-full bg-white'>
            <div className="w-[80%] py-5 m-auto flex items-center justify-between">
                <div className="">
                    <Link href={"/"}>
                        <span className="text-xl font-600">E-Shop</span>
                    </Link>
                </div>
                <div className="w-[50%] relative">
                    <input type="text" placeholder='Search🔍' className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[40px]' />
                    <div className="w-[60px] cursor-pointer flex items-center justify-center h-[40px] bg-[#3489FF] absolute top-0 right-0">
                        <Search color='#fff' />
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        {
                            !isLoading && user ? (
                                <>
                                    <Link href={"/profile"} className='flex items-center justify-center border-2 rounded-full p-1'>
                                        <User />
                                    </Link>
                                    <Link href={"/login"}>
                                        <span className='block font-medium'> Hello,</span>
                                        <span className="font-semibold ">{user.name?.split(" ")[0]}</span>
                                    </Link>
                                </> 
                            ) : (
                                <>
                                    <Link href={"/login"} className='flex items-center justify-center border-2 rounded-full p-1'>
                                        <User />
                                    </Link>
                                    <Link href={"/login"}>
                                        <span className='block font-medium'> Hello,</span>
                                        <span className="font-semibold ">{!isLoading && "SignIn"}</span>
                                    </Link>

                                </>

                            )
                        }

                    </div>
                    <div className="flex items-center gap-5">
                        <Link href={"/wishlist"} className='relative'>
                            <Heart className='h-7 w-7' />
                            <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-7px] right-[-7px]">
                                <span className='text-white text-xs'>{wishlist?.length}</span>
                            </div>
                        </Link>
                        <Link href={"/cart"} className='relative'>
                            <ShoppingCart className='h-7 w-7' />
                            <div className="w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-7px] right-[-7px]">
                                <span className='text-white text-xs'>{cart?.length}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-b border-slate-200" />
            <HearderBottom />

        </div>
    )
}

export default Header