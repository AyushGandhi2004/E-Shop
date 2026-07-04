"use client";
import GoogleButton from '@/shared/components/GoogleButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';


type FormData = {
    email : string;
    password : string;
}


const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const loginMutation = useMutation({
        mutationFn : async (data : FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, data, {
                withCredentials : true,
            });
            return response.data;
        },
        onSuccess : (data) => {
            setServerError(null);
            if (data?.user) {
                queryClient.setQueryData(['user'], data.user);
            }
            router.push('/');
        },
        onError : (error : AxiosError) => {
            const errorMessage = (error.response?.data as {message?:string})?.message || "Invalid Credentials";
            setServerError(errorMessage);
        }
    });

    const onSubmit = async (data : FormData) => {
        loginMutation.mutate(data);
    }

    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className="text-3xl font-semibold text-black text-center"> Login </h1>
            <p className="text-center text-lg font-medium py-3 text-[#00000099]">
                Home . Login
            </p>
            <div className="w-full flex justify-center">
                <div className="md:w-120 p-8 bg-white shadow rounded-lg ">
                    <h3 className="text-2xl font-semibold text-center mb-2">
                        Login to E-Shop
                    </h3>
                    <p className="text-center text-gray-500 mb-4">
                        Don't have an account?
                        <Link className='text-blue-500 hover:text-blue-800' href={"/signup"}> SignUp</Link>
                    </p>

                    <GoogleButton/>
                    <div className="flex items-center my-5 text-gray-400 text-sm">
                        <div className="flex-1 border-t border-gray-300"/>
                        <span className="px-3"> or SignIn with email</span>
                        <div className="flex-1 border-t border-gray-300"/>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
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
                        <div className="flex items-center justify-between my-4">
                                <label className="flex items-center text-gray-600">
                                    <input type="checkbox" className='mr-2' checked={rememberMe} onChange={()=> setRememberMe(!rememberMe)} />
                                    Remember Me
                                </label>
                                <Link href={"/forget-password"} className='text-blue-500 text-sm' > Forgot Password? </Link>
                            </div>
                        
                        <button type="submit" className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg' disabled={loginMutation.isPending} >
                            {
                                loginMutation.isPending ? "Logging in..." : "LogIn"
                            }
                        </button>

                        {
                            serverError && (
                                <p className="text-red-500 text-sm">
                                    {
                                        serverError
                                    }
                                </p>
                            )
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login