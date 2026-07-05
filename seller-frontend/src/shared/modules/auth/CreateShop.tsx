import { shopCategories } from '@/utils/shopCategories';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';

const CreateShop = ({sellerId, setActiveStep} : {sellerId: string | null; setActiveStep: (step: number) => void}) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const countWords = (str : string) => {
        return str.trim().split(/\s+/).length;
    }

    const createShopMutation = useMutation({
        mutationFn : async (data : FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/create`, data);

            return response.data;
        },
        onSuccess : (data)=> {
            setActiveStep(3);
        }
    });

    const onSubmit = async (data : any) => {
        const shopData = { ...data, sellerId};
        createShopMutation.mutate(shopData);
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">Create new Shop</h3>
                <label className="block text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" placeholder='Shop Name' {...register("name",{
                    required : "Shop Name is required"
                })} />
                {
                    errors.name && (
                        <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
                    )
                }

                <label className="block text-gray-700 mb-1">Bio (max 150 words)</label>
                <input type="text" className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" placeholder='Shop Bio' {...register("bio",{
                    required : "Shop Bio is required",
                    validate : (value) => countWords(value) <= 150 || "Bio should not exceed 150 words"
                })} />
                {
                    errors.bio && (
                        <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
                    )
                }

                <label className="block text-gray-700 mb-1">Address</label>
                <input type="text" className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" placeholder='Shop Address' {...register("address",{
                    required : "Shop Address is required"
                })} />
                {
                    errors.address && (
                        <p className="text-red-500 text-sm">{String(errors.address.message)}</p>
                    )
                }

                <label className="block text-gray-700 mb-1">Opening Hours</label>
                <input type="text" className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" placeholder='Shop Opening Hours' {...register("opening_hours",{
                    required : "Shop Opening Hours is required"
                })} />
                {
                    errors.opening_hours && (
                        <p className="text-red-500 text-sm">{String(errors.opening_hours.message)}</p>
                    )
                }

                <label className="block text-gray-700 mb-1">Website</label>
                <input type="text" className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" placeholder='Shop Website' {...register("website",{
                    pattern : {
                        value : /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
                        message : "Invalid Website URL"
                    }
                })} />
                {
                    errors.website && (
                        <p className="text-red-500 text-sm">{String(errors.website.message)}</p>
                    )
                }

                <label className="block text-gray-700 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-300 outline-o rounded-[4px] mb-1" {...register("category",{
                    required : "Shop Category is required"
                })} >
                    {
                        shopCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))
                    }
                </select>
                {
                    errors.category && (
                        <p className="text-red-500 text-sm">{String(errors.category.message)}</p>
                    )
                }

                <button type='submit' className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-4">Create</button>
            </form>
        </div>
    )
}

export default CreateShop