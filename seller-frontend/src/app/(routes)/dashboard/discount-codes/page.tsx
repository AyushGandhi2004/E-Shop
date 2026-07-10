"use client";

import { ChevronRight, Delete, Plus, Trash, X } from 'lucide-react'
import React, { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import Input from '@/shared/components/Input';
import DeleteDiscountModal from '@/shared/components/DeleteDiscountModal';

const Page = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<any>();
    const queryClient = useQueryClient();
    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/products/api/seller/discount-codes");
            return res?.data?.discount_codes || [];
        }
    })

    const {register, handleSubmit, reset, control, formState : {errors}} = useForm({
        defaultValues : {
            public_name : "",
            discountType : "percentage",
            discountValue : "",
            discountCode : ""
        }
    })

    const createDiscountCodesMutation = useMutation({
        mutationFn : async (data : FormData) => {
            await axiosInstance.post('/products/api/seller/discount-codes',data);
        },
        onSuccess : ()=>{
            queryClient.invalidateQueries({queryKey : ['shop-discounts']});
            reset();
            setShowModal(false);
        }
    })

    const deleteDiscountCodeMutation = useMutation({
        mutationFn : async (discountId : string)=>{
            await axiosInstance.delete(`/products/api/seller/discount-codes/${discountId}`);
        },
        onSuccess : () => {
            queryClient.invalidateQueries({queryKey : ['shop-discounts']});
            setShowDeleteModal(false);
        }
    })

    const onSubmit = async (data : any)=>{
        if(discountCodes?.length>=8){
            toast.error("You can only create a maximum of 8 discount codes");
            return;
        }
        createDiscountCodesMutation.mutate(data);
    }

    const handleDeleteClick = async (discount: any) => {
        setSelectedDiscount(discount);
        setShowDeleteModal(true);
    }

    

    return (
        <div className='w-full min-h-screen p-8'>
            <div className="flex justify-between items-center mb-1">
                <h2 className='text-2xl text-white font-semibold'>Discount Codes</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Create Discount
                </button>
            </div>
            {/* Breadcrumbs */}
            <div className="flex items-center text-white">
                <Link className="text-[#80Deea] cursor-pointer" href={'/dashboard'}>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span className="">Discount Codes</span>
            </div>

            <div className="mt-8 p-6 bg-gray-900 rounded-lg shadow-lg">
                <h3 className='text-lg font-semibold text-white mb-4'>Your Discount Codes</h3>
                {
                    isLoading ? (
                        <p className="text-gray-400 text-center">Loading discount codes...</p>
                    ) : (<>
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="p-3 text-left">Title</th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Value</th>
                                    <th className="p-3 text-left">Code</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    discountCodes?.map((discount: any) => (
                                        <tr key={discount?.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                                            <td className='p-3'>{discount?.public_name}</td>
                                            <td className="p-3 capitalize">
                                                {discount?.discountType === "percentage" ? "Percentage(%)" : "Flat(Rs)"}
                                            </td>
                                            <td className='p-3'>{discount.discountType === "percentage" ? `${discount?.discountValue}%` : `₹${discount?.discountValue}`}</td>
                                            <td className='p-3'>{discount?.discountCode}</td>
                                            <td className="p-3">
                                                <button className="text-red-400 hover:text-red-300 transition"
                                                    onClick={() => handleDeleteClick(discount)}>
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        {
                            discountCodes?.length === 0 && (
                                <p className="text-gray-400 text-center pt-4">
                                    No Discount Codes Available!
                                </p>
                            )
                        }

                    </>


                    )
                }

            </div>

            {/* Create Discount Modal */}
            {
                showModal && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                                <h3 className="text-xl text-white">Create Discount Code</h3>
                                <button onClick={()=> setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={22}/>
                                </button>
                            </div>

                            <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                                {/* Title */}
                                <Input
                                label='Title (Public Name)'
                                {...register('public_name', { required: 'Title is required' })}
                                />
                                {
                                    errors.public_name && <p className="text-red-500 text-sm mt-1">{errors.public_name.message}</p>
                                }
                                {/* Discount Type */}
                                <div className="mt-4">
                                    <label className="block text-gray-300 mb-1 font-semibold">Discount Type</label>
                                    <Controller
                                    control={control}
                                    name='discountType'
                                    render={({field})=>(
                                        <select {...field} className="w-full border outline-none border-gray-700 bg-transparent text-gray-300 p-3">
                                            <option value="percentage" className='bg-gray-800 text-gray-300'>Percentage (%)</option>
                                            <option value="flat" className='bg-gray-800 text-gray-300'>Flat Amount</option>
                                        </select>
                                    )}
                                    />
                                </div>

                                {/* Discount Value */}
                                <div className="mt-4">
                                    <Input
                                    label='Discount Value'
                                    type='number'
                                    min={1}
                                    {
                                        ...register('discountValue', { required: 'Discount Value is required' })
                                    }
                                    />

                                </div>
                                
                                <div className="mt-4">
                                    <Input
                                    label='Discunt Code'
                                    {
                                        ...register('discountCode', { required: 'Discount Code is required' })
                                    }
                                    />
                                </div>

                                <button type='submit' className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2" disabled={createDiscountCodesMutation.isPending}>
                                    <Plus size={20} /> {
                                        createDiscountCodesMutation.isPending ? "Creating..." : "Create"
                                    }
                                </button>
                                {
                                    createDiscountCodesMutation.isError && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {createDiscountCodesMutation.error?.message || "An error occurred while creating the discount code."}
                                        </p>
                                    )
                                }
                            </form>
                        </div>

                    </div>
                )
            }
            {
                showDeleteModal && selectedDiscount && (
                    <DeleteDiscountModal discount={selectedDiscount} onClose={() => setShowDeleteModal(false)} onConfirm={()=>deleteDiscountCodeMutation.mutate(selectedDiscount?.id)} />
                )
            }
        </div>
    )
}

export default Page