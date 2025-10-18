type SquareProps = {
  value: number | null
  onClick: () => void
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => {
  return (
    <button
      className='flex h-18 w-18 items-center justify-center rounded-xl bg-[#1f3641] p-2 text-2xl font-semibold text-white shadow-[inset_0_-4px_0_#10212a] select-none md:h-20 md:w-20'
      onClick={onClick}
    >
      {value}
    </button>
  )
}

export default Square
