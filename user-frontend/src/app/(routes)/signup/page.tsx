"use client";
import GoogleButton from '@/shared/components/GoogleButton';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios, {AxiosError} from 'axios';


type FormData = {
    name : string;
    email : string;
    password : string;
}


const Signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [sendResend, setSendResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const handleOtpChange = (index : number, value : string)=> {
        if(!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if(value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleOtpKeyDown = (index : number, e : React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const resendOtp = () => {
        if(userData){
            signupMutation.mutate(userData);
        }
    }

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev)=>{
                if(prev <=1){
                    clearInterval(interval);
                    setSendResend(true);
                    return 0;
                }
                return prev-1;
            })
        },1000);
    }

    const signupMutation = useMutation({
        mutationFn : async (data : FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, data);
            return response.data;
        },
        onSuccess : (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            setSendResend(false);
            setTimer(60);
            startResendTimer();
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn : async () => {
            if(!userData) return ;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`,{
                ...userData,
                otp : otp.join(""),
            });
            return response.data;
        },
        onSuccess : () => {
            router.push('/login');
        }
    })

    const onSubmit = async (data : FormData) => {
        signupMutation.mutate(data);
    }

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className="text-3xl font-semibold text-black text-center"> SignUp </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Signup
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-[480px] p-8 bg-white shadow rounded-lg ">
                    <h3 className="text-2xl font-semibold text-center mb-2">
                        SignUp to E-Shop
                    </h3>
                    <p className="text-center text-gray-500 mb-4">
                        Already have an account?
                        <Link className='text-blue-500 hover:text-blue-800' href={"/login"}> Log In</Link>
                    </p>

                    <GoogleButton/>
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300"/>
                        <span className="px-3"> or SignIn with email</span>
                        <div className="flex-1 border-t border-gray-300"/>
                    </div>

                    {
                        !showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <label className='block text-gray-700 mb-1'>Name</label>
                                <input type="text" placeholder='John Doe' className='w-full p-2 border border-gray-300 outlie-o rounded mb-1' {...register('name',{
                                    required : "Name is required",
                                })}/>
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
                                <input type="email" placeholder='xyz@gmail.com' className='w-full p-2 border border-gray-300 outlie-o rounded mb-1' {...register('email',{
                                    required : "Email is required",
                                    pattern : {
                                        value : /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message : "Invalid email address"
                                    }
                                })}/>
                                {
                                    errors.email && (
                                        <p className="text-red-500 text-sm">
                                            {
                                                String(errors.email.message)
                                            }
                                        </p>
                                    )
                                }

                                <label className='block text-gray-700 mb-1'>Password</label>
                                <div className="relative">
                                    <input type={`${passwordVisible ? "text" : "password"}`} className="w-full p-2 border border-gray-300 outlie-o rounded mb-1" {
                                        ...register("password",{
                                            required : "Password is required",
                                            pattern : {
                                                value : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message : "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
                                            }
                                        })
                                    } />
                                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                        {passwordVisible ? <Eye size={17}/> : <EyeOff size={17}/>}
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
                            </form>
                        ) : (
                            <div className="">
                                <h3 className="text-xl font-semibold text-center mb-4">Enter your OTP</h3>
                                <div className="flex justify-center gap-6 ">
                                    {
                                        otp.map((digit, index) => (
                                            <input type="text" key={index} ref={(el)=>{
                                                if(el) inputRefs.current[index]=el;
                                            }} maxLength={1} className='w-12 h-12 text-center border border-bs-orange-300 outline-none !rounded' value={digit} onChange={(e)=>handleOtpChange(index, e.target.value)} onKeyDown={(e)=> handleOtpKeyDown(index, e)}  />
                                        ))
                                    }
                                </div>
                                <button className="w-full mt-4 text-lg cursor-pointer bg-blue-500" onClick={()=>verifyOtpMutation.mutate()} disabled={verifyOtpMutation.isPending}>
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

                            
                </div>
            </div>
        </div>
    )
}

export default Signup