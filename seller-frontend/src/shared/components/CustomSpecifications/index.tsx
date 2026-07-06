import React from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import Input from '../Input'
import { PlusCircle, Trash2 } from 'lucide-react'

const CustomSpecifications = ({control, errors} : any) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name : "CustomSpecifications"
    })

    return (
        <div>
            <label className="block font-semibold text-gray-300 mb-1">Custom Specifications</label>
            <div className="flex flex-col gap-3">
                {fields.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Controller
                        name = {`CustomSpecifications.${index}.name`}
                        control={control}
                        rules = {{ required: "Specification name is required" }}
                        render={(field) => (
                            <Input
                            label={`Specification Name`}
                            placeholder='e.g. battery, material, etc'
                            {...field}
                            />
                        )}
                        />

                        <Controller
                            name = {`CustomSpecifications.${index}.value`}
                            control={control}
                            rules = {{ required: "Specification value is required" }}
                            render = {({field})=>(
                                <Input
                                 label="Value"
                                 placeholder = "e.g. 5000mAh, cotton, etc"
                                />
                            )}
                        />
                        <button type='button' className='text-red-500 hover:text-red-700'
                        onClick={()=>remove(index)}>
                            <Trash2 size={20}/>
                        </button>
                    </div>
                ))}

                <button className='flex items-center gap-2 text-blue-500 hover:text-blue-700'
                onClick={() => append({ name: '', value: '' })}>
                    <PlusCircle size={15}/>
                    Add Specification
                </button>
            </div>
            {
                errors?.CustomSpecifications && (
                    <p className='text-red-500 text-sm mt-1'>
                        {errors?.CustomSpecifications?.message}
                    </p>
                )
            }
        </div>
    )
}

export default CustomSpecifications