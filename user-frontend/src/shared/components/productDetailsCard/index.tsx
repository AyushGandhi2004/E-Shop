import Link from 'next/link';
import React, { useState } from 'react'
import Ratings from '../Ratings';
import { Heart, MapPin, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocation';
import useDeviceTracking from '@/hooks/useDeviceTracking';

const ProductDetailsCard = ({ data, setOpen }: { data: any; setOpen: (open: boolean) => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [colorSelected, setColorSelected] = useState(data?.colors?.[0] || "");
  const [sizeSelected, setSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const user = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  //Actually we need to fetch this estimated delivery date acc to what is provided by the delivery service like DLH from their portal, but for now let it be 5 days from the current date.
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // Assuming 5 days for delivery

  const addToWishlist = useStore((state : any)=>state.addToWishlist);
  const removeFromWishlist = useStore((state : any)=>state.removeFromWishlist);
  const addToCart = useStore((state : any)=>state.addToCart);
  const removeFromCart = useStore((state : any)=>state.removeFromCart);
  const wishlist = useStore((state : any)=>state.wishlist);
  const isWishlisted = wishlist.some((item : any)=>item.id === data?.id);
  const cart = useStore((state : any)=>state.cart);
  const isInCart = cart.some((item : any)=>item.id === data?.id);

  return (
    <div className='fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50' onClick={() => setOpen(false)}>
      <div className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg" onClick={(e) => e.stopPropagation()}>

        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-full">
            <img src={data?.images?.[activeImage]?.url} alt={data?.title} width={400} height={400}
              className='w-full rounded-lg object-contain' />
            {/* Thumbnails */}
            <div className="flex gap-2 mt-4">
              {
                data?.images?.map((image: any, index: number) => (
                  <div key={index} className={`cursor-pointer border rounded-md ${activeImage === index ? "border-gray-500 border-2 z-20" : "border-transparent"}`} onClick={() => setActiveImage(index)}>
                    <img src={image.url} alt={`Thumbnail ${index + 1}`} width={80} height={80}
                      className='rounded-md' />
                  </div>
                ))
              }
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* Selller Info */}
            <div className="flex items-start justify-between gap-1">
              
                <img src={data?.shop?.avatar} alt={"Shop Logo"} width={80} height={80} className='rounded-full w-[80px] h-[80px] object-cover' />

              <div className='w-full flex flex-col justify-start'>
                <Link href={`shop/${data?.shop?.id}`} className='block text-blue-500 text-sm font-medium my-2 px-2'>
                  {data?.shop?.name}
                </Link>
              
              
                {/* Shop Ratings */}
                <span className="block mt-1"><Ratings rating={data?.shop?.ratings}/></span>

                {/* Shop Location */}
                <p className="text-gray-600 mt-1 flex items-center">
                  <MapPin size={16} className='mr-1' />
                  {data?.shop?.address}
                </p>
              </div>

              <button onClick={()=>router.push(`/inbox?shopId=${data?.shop?.id}`)} className="flex cursor-pointer items-center justify-center gap-2 px-4 w-full bg-blue-500 rounded-lg text-white py-1">
                Chat with Seller
              </button>
            </div>

            <h3 className="text-xl font-semibold mt-3">{data?.title}</h3>

            <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full">
              {data?.description}
            </p>

            {
              data?.brand &&(
                <p className="mt-2">
                  <strong>Brand :</strong>  {data?.brand}
                </p>
              )
            }
            
            {/* Color & Size Options */}
            {
                <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                  {/* Color Options */}
                  {
                    data?.colors?.length > 0 && (
                      <div>
                        <strong>Color :</strong>
                        <div className="flex gap-2 mt-1">
                          {
                            data.colors.map((color:string, index : number) => (
                                <button key={index} className={`w-8 h-8 cursor-pointer rounded-full border-2 ${colorSelected === color ? 'border-blue-500' : 'border-gray-300'}`} style={{ backgroundColor: color }} onClick={() => setColorSelected(color)}></button>
                            ))
                          }
                        </div>
                      </div>
                    )
                  }
                  {/* Size Options */}
                  {
                    data?.sizes?.length > 0 && (
                      <div>
                        <strong>Size :</strong>
                        <div className="flex gap-2 mt-1">
                          {
                            data.sizes.map((size:string, index : number) => (
                                <button key={index} className={`px-3 py-1 border rounded-md ${sizeSelected === size ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border-gray-300'}`} onClick={() => setSizeSelected(size)}>
                                  {size}
                                </button>
                              ))
                          }
                        </div>
                      </div>
                    )
                  }
                </div>
            }

            {/* Price */}
            <div className="mt-5 flex items-center gap-4">
              <h3 className="items-center flex text-2xl font-semibold text-gray-900">${data?.sale_price}</h3>
              {
                data?.regular_price && (
                  <h3 className="text-lg text-red-600 line-through items-center flex">
                    ₹{data?.regular_price}
                  </h3>
                )
              }
                <div className="mt-5 flex items-center gap-5">
                  
                </div>
            </div>

            <div className="flex items-center gap-2 mt-5">
                <div className="flex items-center rounded-md">
                    <button className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md" onClick={()=>setQuantity((prev)=>Math.max(prev-1,1))}>
                      -
                    </button>
                    <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                    <button className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md" onClick={()=>setQuantity((prev)=>prev+1)}>+</button>
                  </div>

                <button className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition`} onClick={()=> !isInCart ? addToCart({...data, quantity : 1}, user, location, deviceInfo) : removeFromCart(data.id, user, location, deviceInfo)}>
                  <ShoppingCart size={20}/> "{ }" 
                  {
                    isInCart ? "Added to Cart" : "Add to Cart"
                  }
                </button>
                <button className="opacity-[.7] cursor-pointer">
                  <Heart size={30} fill={isWishlisted ? 'red' : 'transparent'} stroke={isWishlisted ? 'red' : 'black'} className='border-none outline-none'
                  onClick={()=> isWishlisted? removeFromWishlist(data.id, user, location, deviceInfo) : addToWishlist({...data, quantity : 1}, user, location, deviceInfo)}/>
                </button>

            </div>

            <div className="mt-3">
              {
                data?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">In Stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )
              }
            </div>{" "}
            
            <div className="mt-3 text-gray-600 text-sm ">
              Estimated Delivery:{" "}<strong>{estimatedDelivery.toDateString()}</strong>
            </div>
            
            
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetailsCard