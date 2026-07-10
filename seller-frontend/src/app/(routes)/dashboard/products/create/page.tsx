"use client";
import ImagePlaceHolder from '@/shared/components/ImagePlaceholder';
import Input from '@/shared/components/Input';
import { ChevronRight, Wand, X } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { Controller, set, useForm, Watch } from 'react-hook-form';
import ColorSelector from '@/shared/components/ColorSelector';
import CustomSpecifications from '@/shared/components/CustomSpecifications';
import CustomProperties from '@/shared/components/CustomProperties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import axiosInstance from '@/utils/axiosInstance';
import RichTextEditor from '@/shared/components/RichTextEditor';
import SizeSelector from '@/shared/components/SizeSelector';
import Image from 'next/image';
import { enhancements } from '@/utils/aiEnhancement';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UploadedImage {
    fileId : string;
    file_url : string;
}

const Page = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChange, setIsChange] = useState(true);
    const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [imageLoader, setImageLoader] = useState(false);
    const [activeEffect, setActiveEffect] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get(`/products/api/categories`);
                console.log(response.data)
                return response.data.data;
            } catch (error) {
                console.log(error)
                return { categories: [], subCategories: {} };
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || [];
    const selectedCategory = watch("category");
    const regular_price = watch("regular_price");
    const router = useRouter();

    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData])

    const { data: discountCodes = [], isLoading : discountLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/products/api/seller/discount-codes");
            return res?.data?.discount_codes || [];
        }
    })

    const applyTransformations = async (effect : string)=>{
        if(!selectedImage || processing) return;
        setProcessing(true);
        setActiveEffect(effect);

        try {
            const transformedUrl = `${selectedImage}?tr=${effect}`;
            setSelectedImage(transformedUrl);
        } catch (error) {
            console.log(error);
            return;
        } finally{
            setProcessing(false);
        }
    }


    const handleCreateProduct = () => {

    }

    const handleSaveDraft = () => {

    }

    const convertFileToBase64 = (file : File) => {
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    }

    const handleRemoveImage = async (index: number) => {

        try {
            const updatedImages = [...images];
            const imageToDelete = updatedImages[index];

            if(imageToDelete && typeof imageToDelete === "object") {
                await axiosInstance.delete('/products/api/image', { data: { fileId: imageToDelete.fileId } });
            }
            updatedImages.splice(index, 1);
            if(updatedImages.length < 8 && !updatedImages.includes(null)) {
                updatedImages.push(null);
            }
            setImages(updatedImages);
            setValue("images", updatedImages);
        } catch (error) {
            console.log(error)
        }
    }

    const handleImageChange = async (file: File | null, index: number) => {
        if(!file) return;

        try {
            setImageLoader(true);
            const fileName = await convertFileToBase64(file);
            const res = await axiosInstance.post("/products/api/image",{fileName});
            const updatedImages = [...images];
            const uploadedImage = {
                fileId : res.data.fileId,
                file_url : res.data.file_url
            }
            updatedImages[index] = uploadedImage;
            if(index===images.length-1 && images.length<8){
                updatedImages.push(null);
            }
            setImages(updatedImages);
            setValue("images", updatedImages);

        } catch (error) {
            console.log(error)
        }finally{
            setImageLoader(false);
        }
    }

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            console.log(data)
            const res = await axiosInstance.post("/products/api/seller/products", data);
            router.push("/dashboard/products");
        } catch (error : any) {
            toast.error(error?.data?.message);
            return;
        }finally{
            setLoading(false);
        }
    }

    return (
        <form className="w-full mx-auto p-8 shadow-md rounded-lg text-white" onSubmit={handleSubmit(onSubmit)}>
            {/* Heading and Breadcrums */}
            <h2 className="text-2xl py-2 font-semibold text-white">
                Create Product
            </h2>
            <div className="flex items-center">
                <span className="cursor-pointer text-[#80Deea]">Dashboard</span>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span className="cursor-pointer text-[#80Deea]">Create Product</span>
            </div>

            {/* Content Layout */}
            <div className="py-4 w-full flex gap-6">
                {/* Left section - Image Upload section */}
                <div className="md:w-[35%] ">
                    {
                        images?.length > 0 && (
                            <ImagePlaceHolder
                                setOpenImageModal={setOpenImageModal}
                                size='765 x 850'
                                small={false}
                                index={0}
                                images={images}
                                setSelectedImage = {setSelectedImage}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                                imageLoader={imageLoader}
                            />
                        )
                    }

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {
                            images.slice(1).map((_, index) => (
                                <ImagePlaceHolder
                                    setOpenImageModal={setOpenImageModal}
                                    size='765 x 850'
                                    small
                                    index={index + 1}
                                    key={index}
                                    images={images}
                                    setSelectedImage = {setSelectedImage}
                                    onImageChange={handleImageChange}
                                    onRemove={handleRemoveImage}
                                    imageLoader={imageLoader}
                                />
                            ))
                        }
                    </div>
                </div>


                {/* Right section - Product Details */}
                <div className="md:w-[65%]">
                    <div className="w-full flex gap-6">
                        {/* Product Titles */}
                        <div className="w-2/4">
                            <Input
                                label="Product Title"
                                placeholder="Enter product Title"
                                {...register("title", { required: "Product title is required" })}
                            />
                            {
                                errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>
                                )
                            }

                            <div className="mt-2">
                                <Input
                                    type="textarea"
                                    rows={7}
                                    cols={10}
                                    label="Short Description * (Max 150 words)"
                                    placeholder="Enter product short description"
                                    {...register("description", {
                                        required: "Product description is required",
                                        validate: (value) => {
                                            const wordCount = value.trim().split(/\s+/).length;
                                            return (
                                                wordCount <= 150 || "Description should not exceed 150 words"
                                            )
                                        }
                                    })}
                                />
                                {
                                    errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Tags (seperated by commas) *"
                                    placeholder="E.g : Phone, iPhone, apple, flagship"
                                    {...register("tags", { required: "Product tags are required" })}
                                />
                                {
                                    errors.tags && (
                                        <p className="text-red-500 text-sm mt-1">{errors.tags.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Warranty *"
                                    placeholder="E.g : 1 year, 6 months"
                                    {...register("warranty", { required: "Product warranty is required" })}
                                />
                                {
                                    errors.warranty && (
                                        <p className="text-red-500 text-sm mt-1">{errors.warranty.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Slug *"
                                    placeholder="Product Slug E.g : apple-iphone-14-pro-max"
                                    {...register("slug", {
                                        required: "Product slug is required",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message: "Slug can only contain lowercase letters, numbers, and hyphens(No spaces or special characters allowed)",
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Slug should be at least 3 characters long"
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: "Slug should not exceed 100 characters"
                                        }
                                    })}
                                />
                                {
                                    errors.slug && (
                                        <p className="text-red-500 text-sm mt-1">{errors.slug.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label="Brand"
                                    placeholder="E.g : Apple, Samsung, OnePlus"
                                    {...register("brand")}
                                />
                                {
                                    errors.brand && (
                                        <p className="text-red-500 text-sm mt-1">{errors.brand.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <ColorSelector control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <CustomSpecifications control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <CustomProperties control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <label className="font-semibold text-gray-300 block mb-1">
                                    Cash On Delivery *
                                </label>
                                <select {
                                    ...register("cash_on_delivery", { required: "Please select an option" })
                                }
                                    defaultValue="yes"
                                    className="w-full border outline-none border-gray-700 bg-transparent">
                                    <option value="yes" className="bg-black">Yes</option>
                                    <option value="no" className="bg-black">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="w-2/4">
                            <label className="block font-semibold text-gray-300 mb-1">Category *</label>
                            {
                                isLoading ? (
                                    <p className="text-gray-400">Loading categories...</p>
                                ) : isError ? (
                                    <p className="text-red-500">
                                        Failed to fetch Categories
                                    </p>
                                ) : (
                                    <Controller
                                        name="category"
                                        control={control}
                                        rules={{ required: "Please select a category" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className='w-full border outline-none border-gray-700 bg-transparent'
                                            >
                                                {" "}
                                                <option value="" className='bg-black'>
                                                    Select Category
                                                </option>
                                                {
                                                    categories.map((category: string) => (
                                                        <option value={category} key={category} className="bg-black">
                                                            {category}
                                                        </option>
                                                    ))
                                                }

                                            </select>
                                        )}
                                    />
                                )
                            }
                            {
                                errors.category && (
                                    <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>
                                )
                            }

                            <div className="mt-2">
                                <label className="block font-semibold text-gray-300 mb-1">Sub Category *</label>
                                {
                                    isLoading ? (
                                        <p className="text-gray-400">Loading sub-categories...</p>
                                    ) : isError ? (
                                        <p className="text-red-500">
                                            Failed to fetch sub-Categories
                                        </p>
                                    ) : (
                                        <Controller
                                            name="subCategory"
                                            control={control}
                                            rules={{ required: "Please select a sub-category" }}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className='w-full border outline-none border-gray-700 bg-transparent'
                                                >
                                                    {" "}
                                                    <option value="" className='bg-black'>
                                                        Select Sub Category
                                                    </option>
                                                    {
                                                        subCategories.map((sub: string) => (
                                                            <option value={sub} key={sub} className="bg-black">
                                                                {sub}
                                                            </option>
                                                        ))
                                                    }

                                                </select>
                                            )}
                                        />
                                    )
                                }
                                {
                                    errors.subCategory && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subCategory.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <label className="block font-semibold text-gray-300 mb-1">
                                    Detailed Description(min 30 words) 
                                </label>

                                <Controller
                                    name="detailed_description"
                                    control={control}
                                    // rules={{
                                    //     required: "Detailed description is required",
                                    //     validate: (value) => {
                                    //         const wordCount = value.trim()?.split(/\s+/).filter((word: string) => word).length;

                                    //         return (
                                    //             wordCount >= 30 || "Detailed description should be at least 30 words"
                                    //         );
                                    //     },
                                    // }}
                                    render={({ field }) => (
                                        <RichTextEditor value={field.value} onChange={field.onChange} />
                                    )}
                                />
                                {
                                    errors.detailed_description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.detailed_description.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Video URL'
                                    placeholder='https://youtube.com/xyz'
                                    {
                                    ...register("video_url", {
                                        pattern: {
                                            value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                                            message: "Please enter a valid YouTube URL"
                                        },
                                    })
                                    }
                                />
                                {
                                    errors.video_url && (
                                        <p className="text-red-500 text-sm mt-1">{errors.video_url.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Regular Price'
                                    placeholder='2000'
                                    {
                                    ...register("regular_price", {
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Regular price cannot be zero or negative"
                                        },
                                        validate: (value) => !isNaN(value) || "Regular price must be a number"
                                    })
                                    }
                                />{
                                    errors.regular_price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.regular_price.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Sale Price'
                                    placeholder='1500'
                                    {
                                    ...register("sale_price", {
                                        required: "Sale price is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Sale price cannot be zero or negative"
                                        },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Sale price must be a number";
                                            if (regular_price && value > regular_price) {
                                                return "Sale price cannot be higher than regular price";
                                            }
                                            return true;
                                        }
                                    })
                                    }
                                />{
                                    errors.regular_price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.regular_price.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <Input
                                    label='Stock *'
                                    placeholder='100'
                                    {
                                    ...register("stock", {
                                        required: "Stock is required",
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Stock cannot be zero or negative" },
                                        max: { value: 10000, message: "Stock cannot exceed 10000" },
                                        validate: (value) => {
                                            if (isNaN(value)) return "Stock must be a number";
                                            if (!Number.isInteger(value)) return "Stock must be an integer";
                                            return true;
                                        }
                                    })
                                    }
                                />
                                {
                                    errors.stock && (
                                        <p className="text-red-500 text-sm mt-1">{errors.stock.message as string}</p>
                                    )
                                }
                            </div>

                            <div className="mt-2">
                                <SizeSelector control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <label className='block font-semibold text-gray-300 mb-1'>Select Discount Codes (optional)</label>
                                {
                                    discountLoading ? (
                                        <p className="text-gray-400"> Loading discount codes...</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {
                                                discountCodes?.map((discount : any) => (
                                                    <button key={discount.id} className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch('discountCodes')?.includes(discount.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-700" }`} onClick={()=>{
                                                        const currentSelection = watch("discountCodes") || [];
                                                        const updatedSelection = currentSelection?.includes(discount.id) ? currentSelection.filter((id : string)=> id!==discount.id) : [...currentSelection, discount.id]

                                                        setValue("discountCodes",updatedSelection)
                                                    }}>
                                                        {discount.public_name} : ({discount.discountValue})
                                                        {discount.discountType === "percentage" ? "%" : "Rs"}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )
                                }

                            </div>
                        </div>


                    </div>

                </div>
            </div>
            {
                openImageModal && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
                            <div className="flex items-center justify-between pb-3 mb-4">
                                <h2 className="text-lg font-semibold">Enhance Product Image</h2>
                                <X size={20} className='ml-auto cursor-pointer' onClick={() => setOpenImageModal(false)} />
                            </div>
                            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
                                <Image src={selectedImage} alt="product-preview" layout='fill' />
                            </div>
                            {
                                selectedImage && (
                                    <div className="mt-4 space-y-2">
                                        <h3 className="text-white text-sm font-semibold">
                                            AI Enhancement
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                                            {
                                                enhancements.map(({label, effect})=>(
                                                    <button type='button' key={effect} className={`p-2 rounded-md flex items-center gap-2 ${effect === activeEffect} ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                                                    onClick={()=>applyTransformations(effect)} disabled={processing}>
                                                        <Wand size={20} />
                                                        {label}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
            <div className="mt-6 flex justify-end gap-3">
                    {
                        isChange && (
                            <button type='button' className='px-4 py-2 bg-gray-700 text-white rounded-md'
                                onClick={handleSaveDraft}>
                                Save Draft
                            </button>
                        )
                    }
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    {
                        isChange && (
                            <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded-md'
                                >
                                Create
                            </button>
                        )
                    }
                </div>

        </form>
    )
}

export default Page