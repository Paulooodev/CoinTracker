import React from 'react'

const SelectButton = ({ children, selected, onClick}) => {
  return (
    <button
        role='button'
        aria-pressed={selected}
        onClick={onClick}
        className={[
            'cursor-pointer inline-flex items-center rounded-md select-none px-3 py-1 font-medium border',
            selected
                ? 'bg-primary text-white'
                : ''
        ].join('')}
    >
      {children}
    </button>
  )
}

export default SelectButton
