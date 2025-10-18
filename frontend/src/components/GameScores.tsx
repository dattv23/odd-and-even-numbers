import type { Scores } from '@/types/Scores'

type GameScoresProps = {
  player: string | null
  scores: Scores
}

const GameScores: React.FC<GameScoresProps> = ({ player, scores }) => {
  return (
    <div className='flex justify-between'>
      <div className='flex w-24 flex-col items-center rounded-xl bg-[#31C3BD] px-5 py-2 shadow-[inset_0_-4px_0_#1E8E89] md:w-32'>
        <p className='font-semibold'>Odd {player === 'Odd' && '(You)'}</p>
        <span className='text-xl leading-4 font-semibold'>{scores['Odd']}</span>
      </div>
      <div className='flex w-24 flex-col items-center rounded-xl bg-[#F2B137] px-5 py-1 shadow-[inset_0_-4px_0_#C48524] md:w-32'>
        <p className='font-semibold'>Even {player === 'Even' && '(You)'}</p>
        <span className='text-xl leading-4 font-semibold'>{scores['Even']}</span>
      </div>
    </div>
  )
}

export default GameScores
