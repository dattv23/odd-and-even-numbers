import Square from './Square'

type GameBoardProps = {
  squares: Array<number | null>
  onClick: (index: number) => void
}

const GameBoard: React.FC<GameBoardProps> = ({ squares, onClick }) => {
  return (
    <div className='mb-4 grid grid-cols-5 gap-2 py-4'>
      {squares.map((value, i) => (
        <Square value={value} key={i} onClick={() => onClick(i)} />
      ))}
    </div>
  )
}

export default GameBoard
