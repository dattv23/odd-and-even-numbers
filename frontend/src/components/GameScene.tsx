import { useEffect, useRef, useState, useCallback } from 'react'
import GameBoard from './GameBoard'
import GameHeader from './GameHeader'
import GameScores from './GameScores'
import calculateWinner from '@/utils/calculateWinner'

const INIT_SCORES = { Odd: 0, Even: 0 }
const INIT_BOARD = Array(25).fill(0)

const GameScene: React.FC = () => {
  const [board, setBoard] = useState<number[]>(INIT_BOARD)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [player, setPlayer] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPlayable, setIsPlayable] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [scores, setScores] = useState(INIT_SCORES)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (wsRef.current) return
    const ws = new WebSocket('ws://localhost:8888')
    wsRef.current = ws

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      const resetBoard = () => setBoard([...INIT_BOARD])

      const handlers: Record<string, () => void> = {
        START: () => {
          const { player, roomId } = data
          setRoomId(roomId)
          setPlayer(player)
          setMessage('Waiting for opponent...')
        },
        PLAYABLE: () => {
          setMessage(null)
          setIsPlayable(true)
        },
        UPDATE: () => {
          const { square, newValue } = data
          setBoard((prev) => {
            const newBoard = [...prev]
            newBoard[square] = newValue
            return newBoard
          })
        },
        PLAY_AGAIN: () => {
          resetBoard()
          setWinner(null)
          setIsPlayable(true)
          setMessage(null)
        },
        OPPONENT_WAITING: () => {
          resetBoard()
          setWinner(null)
          setIsPlayable(false)
          setMessage(data.message)
        },
        PLAYER_LEFT: () => {
          setMessage(data.message)
          ws.send(JSON.stringify({ type: 'NEW_GAME', data: {} }))
        },
        NEW_GAME: () => {
          const { player, roomId } = data
          resetBoard()
          setScores(INIT_SCORES)
          setRoomId(roomId)
          setPlayer(player)
          setWinner(null)
          setIsPlayable(false)
          setMessage('Waiting for opponent...')
        }
      }

      handlers[type]?.()
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    if (winner) return
    const w = calculateWinner(board)
    if (!w) return

    setWinner(w)
    setScores((prev) => ({ ...prev, [w]: prev[w as keyof typeof prev] + 1 }))
  }, [board, winner])

  const sendMessage = useCallback((type: string, data: object = {}) => {
    wsRef.current?.send(JSON.stringify({ type, data }))
  }, [])

  const handleClick = useCallback(
    (index: number) => {
      if (!isPlayable || winner) return
      sendMessage('INCREMENT', { square: index, currentValue: board[index] })
    },
    [board, isPlayable, winner, sendMessage]
  )

  const handlePlayAgain = useCallback(() => sendMessage('PLAY_AGAIN', { roomId }), [roomId, sendMessage])
  const handleNewGame = useCallback(() => sendMessage('NEW_GAME'), [sendMessage])

  return (
    <div className='relative mx-auto flex h-screen max-w-lg flex-col items-center justify-center px-6'>
      <div className='h-4/5 w-full'>
        <GameHeader
          isPlayable={isPlayable}
          player={player}
          winner={winner}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
          message={message}
        />
        <GameBoard squares={board} onClick={handleClick} />
        {isPlayable && <GameScores scores={scores} player={player} />}
      </div>
      {roomId && <p className='absolute bottom-4 w-full text-center font-bold text-white'>ID: {roomId}</p>}
    </div>
  )
}

export default GameScene
