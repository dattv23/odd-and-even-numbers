import { useEffect, useState } from 'react'

type GameHeaderProps = {
  isPlayable: boolean
  player: string | null
  message: string | null
  winner: string | null
  onPlayAgain: () => void
  onNewGame: () => void
}

const GameHeader: React.FC<GameHeaderProps> = ({ isPlayable, player, message, winner, onPlayAgain, onNewGame }) => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (winner) setShowModal(true)
  }, [winner])

  return (
    <div className='py-2'>
      <div className='flex h-12 items-center justify-between'>
        <div className='flex h-8 gap-2'>
          <h1 className='text-xl font-bold text-white shadow-[inset_0_-4px_0_#6b8997] select-none'>
            <span className='text-[#31C3BD]'>Odd</span> <span className='text-[#a8bfc9]'>&</span>{' '}
            <span className='text-[#F2B137]'>Even</span>
          </h1>
        </div>
        <button
          className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#a8bfc9] shadow-[inset_0_-4px_0_#6b8997] hover:cursor-pointer'
          onClick={() => setShowModal(true)}
        >
          <img src='./icons/icon-restart.svg' width={20} height={20} />
        </button>
      </div>
      <div className='mt-2 h-14 text-center font-extrabold text-[#A8BFC9]'>
        {isPlayable && (
          <p>
            {player == 'Odd' ? (
              <span className='text-[#31C3BD]'>Odd</span>
            ) : (
              <span className='text-[#F2B137]'>Even</span>
            )}{' '}
            (You)
          </p>
        )}
        {message && <p>{message}</p>}
        {winner && winner == player && <p>YOU WON!</p>}
        {winner && winner != player && <p>OH NO, YOU LOST...</p>}
      </div>
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
          <div className='w-[90%] max-w-sm rounded-2xl bg-[#1f3641] p-6 text-center shadow-lg'>
            <h2 className='mb-3 text-xl font-bold text-white'>
              {winner && (winner === player ? 'You Won!' : 'You Lost!')}
            </h2>
            <p className='mb-6 text-[#A8BFC9]'>{`Do you want to ${winner ? 'play again' : 'continue'} or start a new match?`}</p>
            <div className='flex justify-center gap-4'>
              {winner ? (
                <button
                  className='rounded-xl bg-[#31C3BD] px-4 py-2 font-bold text-[#1A2A33] shadow-[inset_0_-4px_0_#118C87] hover:brightness-110'
                  onClick={() => {
                    setShowModal(false)
                    onPlayAgain()
                  }}
                >
                  Play Again
                </button>
              ) : (
                <button
                  className='rounded-xl bg-[#31C3BD] px-4 py-2 font-bold text-[#1A2A33] shadow-[inset_0_-4px_0_#118C87] hover:brightness-110'
                  onClick={() => {
                    setShowModal(false)
                  }}
                >
                  Continue
                </button>
              )}
              <button
                className='rounded-xl bg-[#F2B137] px-4 py-2 font-bold text-[#1A2A33] shadow-[inset_0_-4px_0_#CC8B13] hover:brightness-110'
                onClick={() => {
                  setShowModal(false)
                  onNewGame()
                }}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameHeader
