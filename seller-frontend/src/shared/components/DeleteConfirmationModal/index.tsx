import { X } from 'lucide-react'
import React from 'react'

const DeleteConfirmationModal = ({product, onClose, onConfirm, onRestore} : any) => {
  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center'>
        <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h3 className="text-xl text-white">Delete Product</h3>
                <button className="text-gray-400 hover:text-white" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>
            {/* Body */}
            <p className="text-gray-300 mt-4">
                Are you sure you want to delete {" "}
                <span className="font-semibold text-white">{product.title}</span>?
                <br />
                This product will be moved to the trash and can be restored in next 24 Hrs. You can recover it within this time frame, after which it will be permanently deleted.
            </p>
            {/* Action Buttons */}
            <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white mr-2"
            onClick={onClose}>Cancel</button>
            <button onClick={!product?.isDeleted ? onConfirm : onRestore} className={`${product?.isDeleted ? "bg-green-600 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"}
            px-4 py-2 rounded-md text-white font-semibold transition`}>{product?.isDeleted ? "Restore" : "Delete"}</button>
        </div>
    </div>
  )
}

export default DeleteConfirmationModal