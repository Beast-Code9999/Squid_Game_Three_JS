// server/server.js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://your-netlify-app.netlify.app", "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Also add a test route
app.get('/', (req, res) => {
  res.send('Squid Game Server Running!')
})

const PORT = process.env.PORT || 3000

// Game state
const rooms = new Map()
const ROOM_SIZE = 20 // Max players per room

// Player connected
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('join-game', (data) => {
    // Find or create room
    let roomId = findAvailableRoom()
    if (!roomId) {
      roomId = createRoom()
    }

    // Add player to room
    socket.join(roomId)
    const room = rooms.get(roomId)
    room.players.set(socket.id, {
      id: socket.id,
      name: data.name || `Player ${socket.id.slice(0, 4)}`,
      position: { x: 0, y: 0, z: 145 },
      rotation: { x: 0, y: 0, z: 0 },
      eliminated: false,
      ready: false
    })

    socket.roomId = roomId

    // Send room info to player
    socket.emit('joined-room', {
      roomId,
      playerId: socket.id,
      players: Array.from(room.players.values())
    })

    // Notify others in room
    socket.to(roomId).emit('player-joined', {
      id: socket.id,
      name: room.players.get(socket.id).name,
      position: room.players.get(socket.id).position
    })

    console.log(`Player ${socket.id} joined room ${roomId}`)
  })

  socket.on('player-ready', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room || room.gameStarted) return
    
    const player = room.players.get(socket.id)
    if (!player) return
    
    player.ready = true
    
    // Broadcast ready state
    io.to(socket.roomId).emit('player-ready-update', {
      id: socket.id,
      ready: true,
      totalReady: Array.from(room.players.values()).filter(p => p.ready).length,
      totalPlayers: room.players.size
    })
    
    // Check if all players are ready
    const allReady = Array.from(room.players.values()).every(p => p.ready)
    if (allReady && room.players.size >= 2 && !room.gameStarting) {
      startCountdown(socket.roomId)
    }
  })

  socket.on('player-not-ready', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room || room.gameStarted) return
    
    const player = room.players.get(socket.id)
    if (!player) return
    
    player.ready = false
    
    io.to(socket.roomId).emit('player-ready-update', {
      id: socket.id,
      ready: false,
      totalReady: Array.from(room.players.values()).filter(p => p.ready).length,
      totalPlayers: room.players.size
    })
  })

  socket.on('player-move', (data) => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return
    
    const player = room.players.get(socket.id)
    if (!player) return

    // Update player position
    player.position = data.position
    player.rotation = data.rotation

    // Broadcast to others in room
    socket.to(socket.roomId).emit('player-moved', {
      id: socket.id,
      position: data.position,
      rotation: data.rotation
    })
  })

  socket.on('player-eliminated', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return
    
    const player = room.players.get(socket.id)
    if (!player) return

    player.eliminated = true

    socket.to(socket.roomId).emit('player-eliminated', {
      id: socket.id
    })
  })

  socket.on('game-state', (state) => {
    if (!socket.roomId) return
    
    // Broadcast game state to room
    socket.to(socket.roomId).emit('game-state-update', state)
  })

  socket.on('disconnect', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return

    room.players.delete(socket.id)
    
    // Notify others
    socket.to(socket.roomId).emit('player-left', {
      id: socket.id
    })

    // Clean up empty rooms
    if (room.players.size === 0) {
      rooms.delete(socket.roomId)
    }

    console.log('Player disconnected:', socket.id)
  })
})

function findAvailableRoom() {
  for (const [id, room] of rooms) {
    if (room.players.size < ROOM_SIZE && !room.gameStarted) {
      return id
    }
  }
  return null
}

function createRoom() {
  const roomId = `room-${Date.now()}`
  rooms.set(roomId, {
    id: roomId,
    players: new Map(),
    gameStarted: false,
    gameStarting: false,
    gameState: 'waiting'
  })
  return roomId
}

function startCountdown(roomId) {
  const room = rooms.get(roomId)
  if (!room) return
  
  room.gameStarting = true
  
  // 3 second countdown
  let count = 3
  
  const countdownInterval = setInterval(() => {
    io.to(roomId).emit('countdown', { count })
    
    if (count === 0) {
      clearInterval(countdownInterval)
      
      // Start the game for everyone simultaneously
      room.gameStarted = true
      room.gameStartTime = Date.now()
      
      io.to(roomId).emit('game-start', {
        startTime: room.gameStartTime
      })
      
      // Reset ready states
      room.players.forEach(player => {
        player.ready = false
      })
      
      room.gameStarting = false
    }
    
    count--
  }, 1000)
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})