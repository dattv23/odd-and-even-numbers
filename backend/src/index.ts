import { randomUUID } from 'crypto'
import { WebSocketServer, WebSocket as WS } from 'ws'

const wsServer = new WebSocketServer({ port: 8888 })
console.log('✅ WebSocket server running on ws://localhost:8888')

type Role = 'Odd' | 'Even'

type Room = {
  id: string
  players: Set<WS>
  readyPlayers: Set<WS>
  roles: Map<WS, Role>
}

const rooms: Record<string, Room> = {}

const findAvailableRoom = (): Room | null => Object.values(rooms).find((r) => r.players.size < 2) ?? null

const broadcast = (room: Room, message: object) => {
  const json = JSON.stringify(message)
  room.players.forEach((p) => p.send(json))
}

const getAvailableRole = (room: Room): Role => {
  const taken = new Set(room.roles.values())
  return taken.has('Odd') ? 'Even' : 'Odd'
}

wsServer.on('connection', (ws) => {
  let room = findAvailableRoom()

  if (!room) {
    const newRoomId = randomUUID()
    room = {
      id: newRoomId,
      players: new Set(),
      readyPlayers: new Set(),
      roles: new Map()
    }
    rooms[newRoomId] = room
    console.log(`🆕 Created new room: ${newRoomId}`)
  }

  room.players.add(ws)
  const role = getAvailableRole(room)
  room.roles.set(ws, role)

  ws.send(JSON.stringify({ type: 'START', data: { player: role, roomId: room.id } }))
  console.log(`👤 Player joined room ${room.id} (${room.players.size}/2) as ${role}`)

  if (room.players.size === 1) broadcast(room, { type: 'WAITING_FOR_PLAYER' })
  else if (room.players.size === 2) broadcast(room, { type: 'PLAYABLE' })

  ws.on('message', (msg) => {
    const { type, data } = JSON.parse(msg.toString())

    switch (type) {
      case 'INCREMENT': {
        const { square, currentValue } = data
        broadcast(room!, { type: 'UPDATE', data: { square, newValue: currentValue + 1 } })
        break
      }

      case 'PLAY_AGAIN': {
        room!.readyPlayers.add(ws)

        if (room!.readyPlayers.size === 2) {
          room!.readyPlayers.clear()
          broadcast(room!, { type: 'PLAY_AGAIN' })
          console.log(`🔁 Both players confirmed restart in ${room!.id}`)
        } else {
          ws.send(
            JSON.stringify({
              type: 'OPPONENT_WAITING',
              data: { message: 'Waiting for opponent confirm to play again...' }
            })
          )
        }
        break
      }

      case 'NEW_GAME': {
        const myRole = room!.roles.get(ws)

        if (room!.players.size === 1) {
          room!.readyPlayers.clear()
          ws.send(
            JSON.stringify({
              type: 'NEW_GAME',
              data: { roomId: room!.id, player: myRole }
            })
          )
          broadcast(room!, { type: 'WAITING_FOR_PLAYER' })
          console.log(`🔁 Single player restarted room ${room!.id} as ${myRole}`)
          break
        }

        room!.players.delete(ws)
        room!.readyPlayers.delete(ws)
        room!.roles.delete(ws)

        if (room!.players.size === 0) delete rooms[room!.id]

        const newRoomId = randomUUID()
        const newRoom: Room = {
          id: newRoomId,
          players: new Set([ws]),
          readyPlayers: new Set(),
          roles: new Map([[ws, 'Odd']])
        }
        rooms[newRoomId] = newRoom
        room = newRoom

        ws.send(
          JSON.stringify({
            type: 'NEW_GAME',
            data: { roomId: newRoomId, player: 'Odd' }
          })
        )
        console.log(`🎮 Created new room ${newRoomId} with player as Odd`)
        break
      }

      default:
        console.warn(`⚠️ Unknown message type: ${type}`)
        break
    }
  })

  ws.on('close', () => {
    if (!room) return

    room.players.delete(ws)
    room.readyPlayers.delete(ws)
    room.roles.delete(ws)
    console.log(`❌ Player left room ${room.id} (${room.players.size}/2)`)

    if (room.players.size > 0) {
      broadcast(room, {
        type: 'PLAYER_LEFT',
        data: { message: 'Opponent disconnected. Waiting for opponent reconnect...' }
      })
    } else {
      delete rooms[room.id]
      console.log(`🧹 Deleted empty room ${room.id}`)
    }
  })
})

setInterval(() => {
  for (const id in rooms) {
    if (rooms[id]!.players.size === 0) {
      delete rooms[id]
      console.log(`🧹 Auto-clean empty room ${id}`)
    }
  }
}, 10000)
