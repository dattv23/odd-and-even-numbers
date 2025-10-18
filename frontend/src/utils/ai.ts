import calculateWinner from './calculateWinner'

const minimax = (board: Array<string | null>, depth: number, isMaximizing: boolean): number => {
  const winner = calculateWinner(board)

  if (winner == 'X') return -10 + depth
  if (winner == 'O') return 10 - depth
  if (winner == 'Draw') return 0

  if (isMaximizing) {
    let max = -Infinity
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board]
        newBoard[i] = 'O'
        const evalScore = minimax(newBoard, depth + 1, false)
        max = Math.max(max, evalScore)
      }
    }
    return max
  } else {
    let min = Infinity
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board]
        newBoard[i] = 'X'
        const evalScore = minimax(newBoard, depth + 1, true)
        min = Math.min(min, evalScore)
      }
    }
    return min
  }
}

const getBestMove = (board: Array<string | null>) => {
  const start = performance.now()
  let bestScore = -Infinity
  let move = -1
  let evaluated = 0

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      evaluated += 1
      const newBoard = [...board]
      newBoard[i] = 'O'
      const score = minimax(newBoard, 0, false)
      if (score > bestScore) {
        bestScore = score
        move = i
      }
    }
  }
  const end = performance.now()
  const time = Math.round(end - start)

  return { move, evaluated, time }
}

export { minimax, getBestMove }
