"use client";
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { countries } from '@/utils/countries';
import CreateShop from '@/shared/modules/auth/CreateShop';





const Signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [sendResend, setSendResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<any | null>(null);
    const [activeStep, setActiveStep] = useState(1);
    const [sellerId, setSellerId] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const connectStripe = async () => {
        try {
            if (!sellerId) {
                throw new Error("Seller account is missing. Complete shop setup before connecting Stripe.");
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create`, { sellerId });
            console.log(response)
            if(response.data.url){
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    const resendOtp = () => {
        if (sellerData) {
            signupMutation.mutate(sellerData);
        }
    }

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setSendResend(true);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
    }

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/register`, data);
            console.log(response);
            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setShowOtp(true);
            setSendResend(false);
            setTimer(60);
            startResendTimer();
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/verify`, {
                ...sellerData,
                otp: otp.join(""),
            });
            console.log("response", response);
            return response.data;
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id);
            setActiveStep(2);
        }
    })

    const onSubmit = async (data: any) => {
        signupMutation.mutate(data);
    }

    return (
        <div className="w-full flex flex-col items-center pt-10 min-h-screen">
            {/* stepper */}
            <div className="relative flex items-center justify-between md:w-[50%] mb-8">
                <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10"/>
                {
                    [1,2,3].map((step,index)=>(
                        <div key={index}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`}>
                                {step}
                            </div>
                            <span className="ml-[-15px]">
                                {step === 1 && "Create Account"}
                                {step === 2 && "Setup Shop"}
                                {step === 3 && "Connect Bank"}
                            </span>
                        </div>
                    ))
                }
            </div>

            {/* Steps Content */}
            <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                {
                    activeStep === 1 && (
                        <>
                        {
                            !showOtp ? (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <h2 className='flex items-center justify-center text-xl font-semibold mb-4'>Create Your Seller Account</h2>
                                    <label className='block text-gray-700 mb-1'>Name</label>
                                    <input type="text" placeholder='John Doe' className='w-full p-2 border border-gray-300 outlie-o rounded mb-1' {...register('name', {
                                        required: "Name is required",
                                    })} />
                                    {
                                        errors.name && (
                                            <p className="text-red-500 text-sm">
                                                {
                                                    String(errors.name.message)
                                                }
                                            </p>
                                        )
                                    }


                                    <label className='block text-gray-700 mb-1'>E-mail</label>
                                    <input type="email" placeholder='xyz@gmail.com' className='w-full p-2 border border-gray-300 outlie-o rounded mb-1' {...register('email', {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })} />
                                    {
                                        errors.email && (
                                            <p className="text-red-500 text-sm">
                                                {
                                                    String(errors.email.message)
                                                }
                                            </p>
                                        )
                                    }

                                    <label className='block text-gray-700 mb-1'>Phone Number</label>
                                    <input type="tel" placeholder='9838xxxxxx' className='w-full p-2 border border-gray-300 outlie-o rounded mb-1'{
                                        ...register("phone_number", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Phone number must be 10 digits"
                                            }
                                        })
                                    } />
                                    {
                                        errors.phone_number && (
                                            <p className="text-red-500 text-sm">
                                                {String(errors.phone_number.message)}
                                            </p>
                                        )
                                    }

                                    <label className='block text-gray-700 mb-1'>Country</label>
                                    <select className='w-full p-2 border border-gray-300 outlie-o rounded mb-1' {
                                        ...register("country", {required: "Country is required"})
                                    } >
                                        <option value="">Select your country</option>
                                        {
                                            countries.map((country)=>(
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))
                                        }
                                    </select>
                                    {
                                        errors.country && (
                                            <p className="text-red-500 text-sm">
                                                {String(errors.country.message)}
                                            </p>
                                        )
                                    }

                                    <label className='block text-gray-700 mb-1'>Password</label>
                                    <div className="relative">
                                        <input type={`${passwordVisible ? "text" : "password"}`} className="w-full p-2 border border-gray-300 outlie-o rounded mb-1" {
                                            ...register("password", {
                                                required: "Password is required",
                                                pattern: {
                                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                    message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
                                                }
                                            })
                                        } />
                                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                            {passwordVisible ? <Eye size={17} /> : <EyeOff size={17} />}
                                        </button>
                                        {
                                            errors.password && (
                                                <p className="text-red-500 text-sm">
                                                    {
                                                        String(errors.password.message)
                                                    }
                                                </p>
                                            )
                                        }

                                    </div>


                                    <button type="submit" className='w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg' disabled={signupMutation.isPending} >
                                        {
                                            signupMutation.isPending ? "Signing Up..." : "Sign Up"
                                        }
                                    </button>
                                    {
                                        signupMutation?.isError && signupMutation.error instanceof AxiosError && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {signupMutation.error.response?.data?.message || signupMutation.error.message}
                                            </p>
                                        )
                                    }
                                    <p className="pt-3 text-center">
                                        Already Have an account ? {" "}
                                        <Link href={'/login'} className='text-blue-500' >LogIn</Link>
                                    </p>
                                </form>
                            ) : (
                                <div className="">
                                    <h3 className="text-xl font-semibold text-center mb-4">Enter your OTP</h3>
                                    <div className="flex justify-center gap-6 ">
                                        {
                                            otp.map((digit, index) => (
                                                <input type="text" key={index} ref={(el) => {
                                                    if (el) inputRefs.current[index] = el;
                                                }} maxLength={1} className='w-12 h-12 text-center border border-bs-orange-300 outline-none !rounded' value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} />
                                            ))
                                        }
                                    </div>
                                    <button className="w-full mt-4 text-lg cursor-pointer bg-blue-500" onClick={() => verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}>
                                        {
                                            verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"
                                        }
                                    </button>
                                    <p className="text-center text-sm mt-4">
                                        {
                                            sendResend ? (
                                                <button onClick={resendOtp} className='text-blue-500 cursor-pointer'>
                                                    Resend OTP
                                                </button>
                                            ) : (
                                                `Resend OTP in {timer} seconds`
                                            )
                                        }
                                    </p>
                                    {
                                        verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                                            </p>
                                        )
                                    }
                                </div>
                            )
                        }
                        </>
                    )
                }

                {
                    activeStep === 2 && (
                        <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
                    )
                }

                {
                    activeStep === 3 && (
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
                            <br />
                            <button className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg' onClick={connectStripe}>
                                Connect Stripe
                            </button>
                        </div>
                    )
                }
            </div>

        </div>

    )
}

export default Signup