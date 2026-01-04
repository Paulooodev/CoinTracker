import React from 'react'

const SelectButton = ({ children, selected, onClick}) => {
  return (
    <button
        role='button'
        aria-pressed={selected}
        onClick={onClick}
        className={[
            'min-w-[3rem] transition-all duration-200 cursor-pointer flex items-center justify-center rounded-md px-4 py-2 font-medium border',
            selected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        ].join('')}
    >
      {children}
    </button>
  )
}

export default SelectButton
