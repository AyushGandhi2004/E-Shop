"use client";
import { navItems } from '@/configs/constants';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { AlignLeft, ChevronDown, Heart, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const HearderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const {user, isLoading} = useUser();
    const wishlist = useStore((state : any)=>state.wishlist);
    const cart = useStore((state : any)=>state.cart);

    //Track Scroll Position:
    useEffect(() => {
        const handleScroll = () => {
            if(window.scrollY > 100){
                setIsSticky(true);
            }else{
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return ()=> window.removeEventListener("scroll", handleScroll);
    },[]);

    const {data} = useQuery({
        queryKey : ['categories'],
        queryFn : async () => {
            const res = await axiosInstance.get('products/api/categories');
            return res.data.data;
        },
        staleTime : 30*60*1000, // 30 minutes
    })

    return (
        <div className={`w-full transition-all duration-300 ${ isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${ isSticky ? "pt-3" : "py-0"}`}>
                {/* Add All Dropdown Items */}
                <div className={`w-[260px] ${isSticky && "-mb-2"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`} onClick={()=>setShow((prev)=>!prev)}>
                    <div className="flex items-center gap-2">
                        <AlignLeft color='white'/>
                        <span className="text-white font-medium">All Departments</span>
                    </div>
                    <ChevronDown color="white" />
                </div>
                {/* Dropdown Menu */}
                {
                    show && (
                        <div className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] max-h-[400px] overflow-y-auto bg-white shadow-lg`}>
                            {
                                data?.categories?.length>0 &&  data?.categories?.map((category : any, index:number)=>{
                                    const hasSub = data?.subCategories?.[category]?.length>0;
                                    const isExpanded = expandedCategory === category;
                                    return (
                                        <div className="relative" key={index}>
                                            <button onClick={()=>{
                                                if(hasSub){
                                                    setExpandedCategory((prev)=>prev===category ? null : category);
                                                }else{
                                                    setShow(false);
                                                    window.location.href = `/products?category=${expandedCategory}`
                                                }
                                            }} className="w-full flex items-center justify-between px-5 py-3">
                                                <span>{category}</span>
                                                {
                                                    hasSub && (
                                                        (isExpanded ? (
                                                            <ChevronDown size={16} className='rotate-180 transition-transform'/>
                                                        ) : (
                                                            <ChevronDown size={16} className='transition-transform'/>
                                                        ))
                                                    )
                                                }
                                            </button>
                                            {
                                                isExpanded && hasSub ? (
                                                    <div className="pl-4 bg-gray-50 border-t border-gray-50">
                                                        {
                                                            data?.subCategories[category].map((sub : string, j : number)=>(
                                                                <Link key={j} href={`/products?category=${encodeURIComponent(sub)}`} className='block px-5 py-2 text-sm hover:bg-gray-100' onClick={()=>setShow(false)}>
                                                                    {sub}
                                                                </Link>
                                                            ))
                                                        }
                                                    </div>
                                                ) : (
                                                    <p className="px-5 py-4 text-sm text-gray-500">No subcategories available.</p>
                                                )
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }

                {/* Navigation Links */}
                <div className="flex items-center">
                    {
                        navItems.map((item : NavItemTypes, index:number) => (
                            <Link className='px-5 font-medium text-lg' href={item.href} key={index}>{item.title}</Link>
                        ))
                    }
                </div>
                <div>
                    {
                        isSticky && (
                            <div className="flex items-center gap-8 pb-2">
                                <div className="flex items-center gap-2">
                                    <Link href={'/login'} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full'>
                                        <User/>
                                    </Link>
                                    {
                                        !isLoading && user ? (
                                            <Link href={"/profile"}>
                                                <span className="block font-[500] opacity-[.6]">Hello,</span>
                                                <span className="font-[600]">{user?.name?.split(" ")[0]}</span>
                                            </Link>
                                        ) : (
                                            <Link href={'/login'}>
                                                <span className="block font-[500] opacity-[.6]">Hello,</span>
                                                <span className="font-[600]">{isLoading ? " " : "Sign In"}</span>
                                            </Link>
                                        )
                                    }
                                </div>

                                <div className="flex items-center gap-5">
                                    <Link href={'/wishlist'} className='relative'>
                                        <Heart/>
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
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default HearderBottom