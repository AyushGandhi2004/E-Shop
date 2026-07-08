"use client"
import DeleteConfirmationModal from '@/shared/components/DeleteConfirmationModal';
import axiosInstance from '@/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { BarChart, ChevronRight, Eye, Pencil, Plus, Search, Star, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react'

const fetchProducts = async () => {
    const res = await axiosInstance.get("/products/api/products");
    console.log(res.data);
    return res?.data?.products
}

const Page = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>();

    const queryClient = useQueryClient();

    const { data : products = [], isLoading } = useQuery({
        queryKey: ["shop-products"],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const deleteProduct = async (productId : string) => {
        const res = await axiosInstance.delete(`/products/api/products/${productId}`);
    }
    const restoreProduct = async (productId : string) => {
        const res = await axiosInstance.patch(`/products/api/products/${productId}`);
    }

    const restoreMutation = useMutation({
        mutationFn : restoreProduct,
        onSuccess : () => {
            queryClient.invalidateQueries({queryKey : ["shop-products"]});
            setShowDeleteModal(false);
        }
    })

    const deleteMutation = useMutation({
        mutationFn : deleteProduct,
        onSuccess : () => {
            queryClient.invalidateQueries({queryKey : ["shop-products"]});
            setShowDeleteModal(false);
        }
    }) 

    const columns = useMemo(()=>[
        {
            accessorKey : "image",
            header : "Image",
            cell : ({row} : any) => (<Image src={row.original.images[0]?.url} alt={row.original.images[0]?.url}
            className='w-12 h-12 rounded-md object-cover' width={200} height={200}/>)
        },
        {
            accessorKey : "name",
            header : "Product Name",
            cell : ({row} : any) => {
                const truncatedTile = row.original.title.length > 25 ?
                        `${row.original.title.substring(0, 25)}...` : row.original.title;

                return (
                    <Link href={`${process.env.NEXT_PUBLIC_API_URL}/products/${row.original.slug}`}
                    className='text-blue-400 hover:underline' title={row.original.title}>
                        {truncatedTile}
                    </Link>
                )
            }
        },
        {
            accessorKey : "price",
            header : "Price",
            cell : ({row} : any) => `${row.original.sale_price}`
        },
        {
            accessorKey : "stock",
            header : "Stock",
            cell : ({row} : any) => (
                <span className={`${row.original.stock < 10 ? 'text-red-500' : 'text-white'}`}>
                    {row.original.stock} left
                </span>
            )
        },
        {
            accessorKey : "category",
            header : "Category",
        },
        {
            accessorKey : "rating",
            header : "Rating",
            cell : ({row} : any) => (
                <div className="flex items-center gap-1 text-yellow-400">
                    <Star fill='#fde047' size={18}/> {" "}
                    <span className="text-white">{row.original.rating || 5}</span>
                </div>
            )
        },
        {
            accessorKey : "actions",
            header : "Actions",
            cell : ({row} : any) => (
                <div className="flex gap-3">
                    <Link href={`/products/${row.original.id}`} className='text-blue-400 hover:text-blue-300 transition'>
                        <Eye size={18}/>
                    </Link>
                    <Link href={`/products/edit/${row.original.id}`} className='text-yellow-400 hover:text-yellow-300 transition'>
                        <Pencil size={18}/>
                    </Link>
                    <button className="text-green-400 hover:text-green-300 transition" onClick={()=>openAnalytics(row.original)}>
                        <BarChart size={18}/>
                    </button>
                    <button className="text-red-400 hover:text-red-300 transition" onClick={()=>openDeleteModal(row.original)}>
                        <Trash size={18}/>
                    </button>
                </div>
            )
        }
    ],[])

    const table  = useReactTable({
        data : products,
        columns,
        getCoreRowModel : getCoreRowModel(),
        getFilteredRowModel : getFilteredRowModel(),
        globalFilterFn : "includesString",
        state : {globalFilter},
        onGlobalFilterChange : setGlobalFilter
    })

    const openDeleteModal = (product : any) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    }

  return (
    <div className='w-full min-h-screen p-8'>
        {/* Headers */}
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold">All Products</h2>
            <Link href='/dashboard/products/create' className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center'>
                <Plus size={18}/> {" "} Add Product
            </Link>
        </div>

        {/* BreadCrumbs */}
        <div className="flex items-center mb-4">
            <Link href={'/dashboard'} className='text-blue-400 cursor-pointer'>Dashboard</Link>
            <ChevronRight size={18} className='text-gray-200'/>
            <span className="text-white">All Products</span>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex items-center bg-gray-900 rounded-md p-2 flex-1">
            <Search size={18} className='text-gray-400 mr-2'/>
            <input type="text" placeholder="Search products..." className="w-full bg-transparent text-white outline-none"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg p-4 bg-gray-900">
            {
                isLoading ? (
                    <p className="text-center text-white">Loading...</p>
                ) : (
                    <table className='w-full text-white'>
                        <thead>
                            {
                                table.getHeaderGroups().map((headerGroup)=>(
                                    <tr key={headerGroup.id} className="border-b border-gray-800">
                                        {headerGroup.headers.map((header)=>(
                                            <th key={header.id} className="p-3 text-left">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))
                            }
                        </thead>
                        <tbody >
                            {
                                table.getRowModel().rows.map((row)=>(
                                    <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-900 transition">
                                        {
                                            row.getVisibleCells().map((cell)=>(
                                                <td key={cell.id} className="p-3">
                                                    {
                                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                                    }
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                )
            }
            {
                showDeleteModal && (
                    <DeleteConfirmationModal 
                    product={selectedProduct}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
                    onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
                    />
                )
            }
        </div>
    </div>
  )
}

export default Page

