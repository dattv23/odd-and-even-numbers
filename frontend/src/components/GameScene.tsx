import { useEffect, useRef, useState } from 'react'
import GameBoard from './GameBoard'
import GameHeader from './GameHeader'
import GameScores from './GameScores'
import calculateWinner from '@/utils/calculateWinner'

const initScores = {
  Odd: 0,
  Even: 0
}

const GameScene: React.FC = () => {
  const [board, setBoard] = useState(Array(25).fill(0))
  const [roomId, setRoomId] = useState<string | null>(null)
  const [player, setPlayer] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPlayable, setIsPlayable] = useState<boolean>(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [scores, setScores] = useState(initScores)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (wsRef.current) return

    const ws = new WebSocket('ws://localhost:8888')
    wsRef.current = ws

    ws.onopen = () => {}

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)

      switch (type) {
        case 'START': {
          const { player, roomId } = data as { player: string; roomId: string }
          setRoomId(roomId)
          setPlayer(player)
          setMessage('Waiting for opponent...')
          break
        }
        case 'PLAYABLE':
          setMessage(null)
          setIsPlayable(true)
          break
        case 'UPDATE': {
          const { square } = data as { square: number }
          setBoard((pre) => {
            const newBoard = [...pre]
            newBoard[square] = newBoard[square] + 1
            return newBoard
          })
          break
        }
        case 'PLAY_AGAIN': {
          setWinner(null)
          setBoard(Array(25).fill(0))
          setIsPlayable(true)
          setMessage(null)
          break
        }
        case 'OPPONENT_WAITING': {
          const { message } = data
          setWinner(null)
          setBoard(Array(25).fill(0))
          setIsPlayable(false)
          setMessage(message)
          break
        }
        case 'PLAYER_LEFT': {
          const { message } = data
          setMessage(message)
          ws.send(JSON.stringify({ type: 'NEW_GAME', data: {} }))
          break
        }
        case 'NEW_GAME': {
          const { player, roomId } = data as { player: string; roomId: string }
          setMessage('Waiting for opponent...')
          setRoomId(roomId)
          setPlayer(player)
          setWinner(null)
          setBoard(Array(25).fill(0))
          setIsPlayable(false)
          break
        }
        default:
          break
      }
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

    setScores((prevScores) => {
      if (w === 'Odd') return { ...prevScores, Odd: prevScores.Odd + 1 }
      if (w === 'Even') return { ...prevScores, Even: prevScores.Even + 1 }
      return prevScores
    })
    setWinner(w)
  }, [board, winner])

  const handleClick = (index: number) => {
    if (winner || !isPlayable) return

    if (wsRef.current) {
      const ws = wsRef.current
      ws.send(
        JSON.stringify({
          type: 'INCREMENT',
          data: {
            square: index
          }
        })
      )
    }
  }

  const handlePlayAgain = () => {
    if (wsRef.current && roomId) {
      const ws = wsRef.current
      ws.send(
        JSON.stringify({
          type: 'PLAY_AGAIN',
          data: { roomId }
        })
      )
    }
  }

  const handleNewGame = () => {
    if (wsRef.current && roomId) {
      const ws = wsRef.current
      ws.send(
        JSON.stringify({
          type: 'NEW_GAME',
          data: {}
        })
      )
    }
  }

  return (
    <div className='relative mx-auto my-0 flex h-screen max-w-lg flex-col items-center justify-center px-6 py-0'>
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

      {roomId && <p className='text-bold absolute bottom-4 mx-auto w-full text-center text-white'>ID: {roomId}</p>}
    </div>
  )
}

export default GameScene
