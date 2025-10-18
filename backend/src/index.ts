import { randomUUID } from 'crypto'
import { WebSocketServer, WebSocket as WS } from 'ws'

const wsServer = new WebSocketServer({ port: 8888 })

type Room = {
  id: string
  players: Set<WS>
  readyPlayers: Set<WS>
}

const rooms: Record<string, Room> = {}

function findAvailableRoom(): Room | null {
  for (const roomId in rooms) {
    const room = rooms[roomId]
    if (room && room.players.size < 2) {
      return room
    }
  }
  return null
}

function broadcast(room: Room, message: object) {
  const json = JSON.stringify(message)
  for (const player of room.players) {
    player.send(json)
  }
}

wsServer.on('connection', (ws) => {
  let assignedRoom: Room | null = findAvailableRoom()

  if (!assignedRoom) {
    const newRoomId = randomUUID()
    assignedRoom = {
      id: newRoomId,
      players: new Set(),
      readyPlayers: new Set()
    }
    rooms[newRoomId] = assignedRoom
    console.log(`🆕 Created new room: ${newRoomId}`)
  }

  assignedRoom.players.add(ws)
  console.log(`👤 Player joined room ${assignedRoom.id} (${assignedRoom.players.size}/2)`)

  const playerRole = assignedRoom.players.size === 1 ? 'Odd' : 'Even'
  ws.send(JSON.stringify({ type: 'START', data: { player: playerRole, roomId: assignedRoom.id } }))

  if (assignedRoom.players.size === 1) {
    broadcast(assignedRoom, { type: 'WAITING_FOR_PLAYER', data: {} })
  }

  if (assignedRoom.players.size === 2) {
    broadcast(assignedRoom, { type: 'PLAYABLE', data: {} })
    console.log(`🎮 Room ${assignedRoom.id} is now playable!`)
  }

  ws.on('message', (msg) => {
    const message = msg.toString()
    const { type, data } = JSON.parse(message)

    switch (type) {
      case 'INCREMENT':
        broadcast(assignedRoom, {
          type: 'UPDATE',
          data
        })
        break
      case 'PLAY_AGAIN':
        assignedRoom.readyPlayers.add(ws)
        console.log(`🔁 ${assignedRoom.readyPlayers.size}/2 ready for restart in ${assignedRoom.id}`)
        if (assignedRoom.readyPlayers.size === 2) {
          assignedRoom.readyPlayers.clear()
          broadcast(assignedRoom, { type: 'PLAY_AGAIN', data: {} })
          console.log(`✅ Both players confirmed restart in ${assignedRoom.id}`)
        } else {
          for (const player of assignedRoom.players) {
            if (player === ws) {
              player.send(
                JSON.stringify({
                  type: 'OPPONENT_WAITING',
                  data: {
                    message: 'Waiting for opponent confirm to play again...'
                  }
                })
              )
            }
          }
        }
        break
      case 'NEW_GAME':
        assignedRoom.players.delete(ws)
        if (assignedRoom.players.size === 0) {
          delete rooms[assignedRoom.id]
          console.log(`🗑️ Deleted old room: ${assignedRoom.id}`)
        }
        const newRoomId = randomUUID()
        const newRoom: Room = { id: newRoomId, players: new Set([ws]), readyPlayers: new Set() }
        rooms[newRoomId] = newRoom

        ws.send(
          JSON.stringify({
            type: 'NEW_GAME',
            data: {
              roomId: newRoomId,
              player: 'Odd'
            }
          })
        )

        console.log(`🎮 ${assignedRoom.id} → created new room ${newRoomId}`)
        break
        break
      default:
        break
    }
  })

  ws.on('close', () => {
    if (!assignedRoom) return

    assignedRoom.players.delete(ws)
    console.log(`❌ Player left room ${assignedRoom.id} (${assignedRoom.players.size}/2)`)

    if (assignedRoom.players.size > 0) {
      for (const p of assignedRoom.players) {
        p.send(
          JSON.stringify({
            type: 'PLAYER_LEFT',
            data: { message: 'Opponent disconnected. Waiting for opponent reconnect...' }
          })
        )
        p.close()
      }
    }

    delete rooms[assignedRoom.id]
    console.log(`🗑️ Deleted empty room: ${assignedRoom.id}`)
  })
})
