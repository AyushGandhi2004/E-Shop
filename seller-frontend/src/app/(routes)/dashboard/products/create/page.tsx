"use client";
import ImagePlaceHolder from '@/shared/components/ImagePlaceholder';
import Input from '@/shared/components/Input';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import ColorSelector from '@/shared/components/ColorSelector';
import CustomSpecifications from '@/shared/components/CustomSpecifications';
import CustomProperties from '@/shared/components/CustomProperties';

const Page = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChange, setIsChange] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false);

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages];

            if (index == -1) {
                updatedImages[0] = null;
            } else {
                updatedImages.splice(index, 1);
            }

            if (updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            return updatedImages;
        });
        setValue("images", images);
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images];
        updatedImages[index] = file;

        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null);
        }
        setImages(updatedImages);
        setValue("images", updatedImages);
    }

    const onSubmit = async (data: any) => {

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
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
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
                                    onImageChange={handleImageChange}
                                    onRemove={handleRemoveImage}
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
                                    {...register("desrciption", {
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
                                    errors.desrciption && (
                                        <p className="text-red-500 text-sm mt-1">{errors.desrciption.message as string}</p>
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
                                    label = "Brand"
                                    placeholder = "E.g : Apple, Samsung, OnePlus"
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
                                <CustomSpecifications control={control} errors={errors}/>
                            </div>

                            <div className="mt-2">
                                <CustomProperties control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <label className="font-semibold text-gray-300 block mb-1">
                                    Cash On Delivery *
                                </label>
                                <select {
                                    ...register("cod", { required: "Please select an option" })
                                }
                                defaultValue="yes"
                                className="w-full border outline-none border-gray-700 bg-transparent">
                                    <option value="yes" className="bg-black">Yes</option>
                                    <option value="no" className="bg-black">No</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </form>
    )
}

export default Page