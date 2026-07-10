"use client";
import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

const Hero = () => {
    const router = useRouter();

    return (
        <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
            <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
                <div className="md:w-1/2">
                    <p className="font-normal text-white text-xl pb-2">
                        Starting from Rs. 40
                    </p>
                    <h1 className="text-white text-6xl font-extrabold">
                        The best Watch <br />
                        Collection for you
                    </h1>
                    <p className="text-3xl pt-4 text-white">
                        Exclusive Offer <span className="text-yellow-400">10%</span> off this week
                    </p>
                    <br />
                    <button onClick={()=>router.push('/products')} className="w-[140px] gap-2 font-semibold h-[40px] flex items-center rounded-lg justify-center hover:bg-white">
                        Shop Now <MoveRight/>
                    </button>
                </div>
                <div className="md:w-1/2 flex justify-center">
                    {/* <Image src={""} width={450} height={450} alt=''/> */}
                </div>
            </div>
        </div>
    )
}

export default Hero