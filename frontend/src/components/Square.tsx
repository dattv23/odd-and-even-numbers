type SquareProps = {
  value: number
  onClick: () => void
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <button
      className='flex h-14 w-14 items-center justify-center rounded-xl bg-[#1f3641] p-2 text-2xl font-semibold text-white shadow-[inset_0_-4px_0_#10212a] select-none md:h-20 md:w-20'
      onClick={onClick}
    >
      {value == 0 && <span>{value}</span>}
      {value != 0 && value % 2 != 0 && <span className='text-[#31C3BD]'>{value}</span>}
      {value != 0 && value % 2 == 0 && <span className='text-[#F2B137]'>{value}</span>}
    </button>
  )
}

export default Square
