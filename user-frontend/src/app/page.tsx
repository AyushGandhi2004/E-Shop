"use client";
import Hero from '@/shared/components/Hero'
import ProductCard from '@/shared/components/ProductCard';
import SectionTitle from '@/shared/components/SectionTitle';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

const page = () => {
    const { data : products, isLoading, isError } = useQuery({
      queryKey: ['products'],
      queryFn: async () => {
          const res = await axiosInstance.get("/products/api/products?page=1&limit=10");
          console.log(res.data.total)
          return res.data.products
      },
      staleTime : 2*60*1000, // 2 minutes
    })

    const { data : latestProducts } = useQuery({
      queryKey: ['latest-products'],
      queryFn : async () => {
        const res = await axiosInstance.get('products/api/products?page=1&limit=10&type=latest');
        return res.data.products
      },
      staleTime : 2*60*1000, // 2 minutes
    })

    return (
      <div className='bg-[#f5f5f5]'>
          <Hero/>
          <div className="md:w-[80%] w-[90%] my-10 m-auto">
            <div className="mb-8">
              <SectionTitle title='Suggested Products'/>
            </div>
            {
              <div >
                {
                  isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {Array.from({length: 10}).map((_, index)=>(
                      <div className="h-[250px] bg-gray-300 animate-pulse rounded-xl" key={index}/>
                    ))}

                    </div>
                      
                  )
                }
                {
                  !isLoading && !isError && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                      {
                        products?.map((product : any)=>(
                          <ProductCard key={product.id} product={product}/>
                        ))
                      }
                    </div>
                  )
                }
              </div>
            }
          </div>
      </div>
    )
}

export default page