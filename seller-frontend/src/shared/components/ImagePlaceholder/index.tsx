import { Pencil, WandSparkles, X } from 'lucide-react';
import React, { useState } from 'react'
import Image from 'next/image';

const ImagePlaceHolder = ({
    size, small, onImageChange, onRemove, defaultImage=null, index=null, setOpenImageModal,
} : {
    size : string; small? : boolean; onImageChange : (file : File | null, index : number) => void; onRemove? : (index : number) => void; defaultImage? : string | null; index?: any; setOpenImageModal : (openImageModal : boolean) => void
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

    const handleFileChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file){
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index!);
        }
    }

    return (
        <div className={`relative ${small ? "h-[180px]" : "h-[450px]"} w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col items-center justify-center`}>

            <input type="file" accept='image/*' className='hidden' id={`image-upload-${index}`} onChange={handleFileChange}/>
            {
                imagePreview ? (
                    <>
                    <button type='button' onClick={()=> onRemove?.(index!)} className="absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg"><X size={15}/></button>

                    <button className="absolute top-3 p-2 right-[70px] rounded bg-blue-500 shadow-lg cursor-pointer"
                    onClick={()=>setOpenImageModal(true)}>
                        <WandSparkles size={15}/>
                    </button>
                    </>
                ) : (
                    <label htmlFor={`image-upload-${index}`} className='absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg cursor-pointer'>
                        <Pencil size={15}/>
                    </label>
                )
            }

            {
                imagePreview ? (
                    <Image src={imagePreview} alt="Uploaded Image" className='w-full h-full object-cover rounded-lg' width={400} height={300}/>
                ) : (
                    <>
                    <p className={`text-gray-400 ${small ? "text-xl" : "text-4xl"} font-semibold`}>
                        {size}
                    </p>
                    <p className={`text-gray-500 ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
                        Click to upload an image
                    </p>
                    </>
                )
            }

        </div>
    )
}

export default ImagePlaceHolder