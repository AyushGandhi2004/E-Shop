"use client";
import { navItems } from '@/configs/constants';
import useUser from '@/hooks/useUser';
import { AlignLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const HearderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const {user, isLoading} = useUser();

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
                        <div className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5]`}></div>
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
                <div className=""></div>
            </div>
        </div>
    )
}

export default HearderBottom