import React from 'react'

interface CheckboxProps {
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    label: string
    id?: string
}

export default function Checkbox({ checked, onChange, label, id = 'checkbox' }: CheckboxProps) {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    return (
        <div className="inline-flex items-start gap-x-2 mt-2 pr-1">
            <label className="flex items-center cursor-pointer mt-[3px] relative" htmlFor={checkboxId}>
                <input type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer h-[17px] w-[17px] cursor-pointer transition-all appearance-none rounded-[3px] border border-[#000000] checked:bg-[#000000] checked:border-[#000000]"
                id={checkboxId} />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                    stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"></path>
                </svg>
                </span>
            </label>
            <label className="cursor-pointer ml-2 text-[#5F5F5F] text-[18px] font-normal leading-[24px]" htmlFor={checkboxId}>
                <p>
                {label}
                </p>
            </label>
        </div>
    )
}
