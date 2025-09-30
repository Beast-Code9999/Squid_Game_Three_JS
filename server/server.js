const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://stirring-semolina-c2bcc3.netlify.app", "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

app.get('/', (req, res) => {
  res.send('Squid Game Server Running!')
})

const PORT = process.env.PORT || 3000

// Game state
const rooms = new Map()
const ROOM_SIZE = 20

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.on('join-game', (data) => {
    let roomId = findAvailableRoom()
    if (!roomId) {
      roomId = createRoom()
    }

    socket.join(roomId)
    const room = rooms.get(roomId)
    room.players.set(socket.id, {
      id: socket.id,
      name: data.name || `Player ${socket.id.slice(0, 4)}`,
      position: { x: 0, y: 0, z: 145 },
      rotation: { x: 0, y: 0, z: 0 },
      eliminated: false,
      ready: false,
      completedRLGL: false,
      tugReady: false
    })

    socket.roomId = roomId

    socket.emit('joined-room', {
      roomId,
      playerId: socket.id,
      players: Array.from(room.players.values())
    })

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
    
    io.to(socket.roomId).emit('player-ready-update', {
      id: socket.id,
      ready: true,
      totalReady: Array.from(room.players.values()).filter(p => p.ready).length,
      totalPlayers: room.players.size
    })
    
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

    player.position = data.position
    player.rotation = data.rotation

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
    socket.to(socket.roomId).emit('game-state-update', state)
  })

  // ============= TUG OF WAR EVENTS =============

  socket.on('level-complete', (data) => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return
    
    const player = room.players.get(socket.id)
    if (!player) return
    
    if (data.level === 'rlgl') {
      console.log(`Player ${socket.id} completed RLGL`)
      player.completedRLGL = true
      
      const alivePlayers = Array.from(room.players.values()).filter(p => !p.eliminated)
      const completedPlayers = alivePlayers.filter(p => p.completedRLGL)
      
      console.log(`${completedPlayers.length}/${alivePlayers.length} players completed RLGL`)
      
      socket.emit('wait-for-players', {
        completed: completedPlayers.length,
        total: alivePlayers.length
      })
      
      io.to(socket.roomId).emit('rlgl-completion-update', {
        completed: completedPlayers.length,
        total: alivePlayers.length
      })
      
      if (completedPlayers.length >= alivePlayers.length && alivePlayers.length >= 2 && !room.tugOfWarStarted) {
        console.log('All players finished RLGL! Starting Tug of War...')
        room.tugOfWarStarted = true
        
        setTimeout(() => {
          io.to(socket.roomId).emit('all-players-ready-tug')
          
          setTimeout(() => {
            startTugOfWarRace(socket.roomId)
          }, 3000)
        }, 2000)
      }
    }
  })

  socket.on('typing-progress', (data) => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room || !room.tugOfWarRace) return
    
    room.tugOfWarRace.playerProgress.set(socket.id, {
      wordIndex: data.wordIndex,
      percentage: data.percentage,
      wpm: data.wpm || 0
    })
    
    socket.to(socket.roomId).emit('race-progress', {
      playerId: socket.id,
      wordIndex: data.wordIndex,
      percentage: data.percentage
    })
  })

  socket.on('typing-complete', (data) => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room || !room.tugOfWarRace) return
    
    const race = room.tugOfWarRace
    const player = room.players.get(socket.id)
    
    if (race.completions.some(c => c.playerId === socket.id)) return
    
    const completion = {
      playerId: socket.id,
      name: player ? player.name : 'Unknown',
      time: data.time,
      wpm: data.wpm,
      finishTime: Date.now(),
      place: race.completions.length + 1
    }
    
    race.completions.push(completion)
    
    console.log(`${completion.name} finished in place ${completion.place}`)
    
    io.to(socket.roomId).emit('player-finished-typing', completion)
    
    if (race.completions.length === 1) {
      console.log(`${completion.name} WON the race!`)
      setTimeout(() => {
        endTugOfWarRace(socket.roomId)
      }, 5000)
    }
  })

  socket.on('tug-ready', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room || !room.tugOfWarRace) return
    
    const player = room.players.get(socket.id)
    if (!player) return
    
    player.tugReady = true
    
    const alivePlayers = Array.from(room.players.values()).filter(p => !p.eliminated)
    const readyPlayers = alivePlayers.filter(p => p.tugReady)
    
    console.log(`${readyPlayers.length}/${alivePlayers.length} players ready for Tug of War`)
    
    io.to(socket.roomId).emit('tug-ready-update', {
      ready: readyPlayers.length,
      total: alivePlayers.length
    })
    
    if (readyPlayers.length >= alivePlayers.length) {
      io.to(socket.roomId).emit('tug-typing-start')
    }
  })

  socket.on('tug-not-ready', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return
    
    const player = room.players.get(socket.id)
    if (!player) return
    
    player.tugReady = false
    
    const alivePlayers = Array.from(room.players.values()).filter(p => !p.eliminated)
    const readyPlayers = alivePlayers.filter(p => p.tugReady)
    
    io.to(socket.roomId).emit('tug-ready-update', {
      ready: readyPlayers.length,
      total: alivePlayers.length
    })
  })

  socket.on('disconnect', () => {
    if (!socket.roomId) return
    
    const room = rooms.get(socket.roomId)
    if (!room) return

    room.players.delete(socket.id)
    
    socket.to(socket.roomId).emit('player-left', {
      id: socket.id
    })

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
    gameState: 'waiting',
    tugOfWarStarted: false,
    tugOfWarRace: null
  })
  return roomId
}

function startCountdown(roomId) {
  const room = rooms.get(roomId)
  if (!room) return
  
  room.gameStarting = true
  
  let count = 3
  
  const countdownInterval = setInterval(() => {
    io.to(roomId).emit('countdown', { count })
    
    if (count === 0) {
      clearInterval(countdownInterval)
      
      room.gameStarted = true
      room.gameStartTime = Date.now()
      
      io.to(roomId).emit('game-start', {
        startTime: room.gameStartTime
      })
      
      room.players.forEach(player => {
        player.ready = false
      })
      
      room.gameStarting = false
    }
    
    count--
  }, 1000)
}

function startTugOfWarRace(roomId) {
  const room = rooms.get(roomId)
  if (!room) return
  
  const paragraphIndex = Math.floor(Math.random() * 10)
  
  console.log(`Starting Tug of War race in room ${roomId} with paragraph ${paragraphIndex}`)
  
  room.players.forEach(player => {
    player.tugReady = false
  })
  
  room.tugOfWarRace = {
    active: true,
    startTime: Date.now(),
    paragraphIndex: paragraphIndex,
    playerProgress: new Map(),
    completions: []
  }
  
  io.to(roomId).emit('tug-race-start', {
    paragraphIndex: paragraphIndex,
    startTime: room.tugOfWarRace.startTime
  })
}

function endTugOfWarRace(roomId) {
  const room = rooms.get(roomId)
  if (!room || !room.tugOfWarRace) return
  
  const race = room.tugOfWarRace
  race.active = false
  
  if (race.completions.length === 0) {
    console.log('Race ended with no completions')
    return
  }
  
  const winner = race.completions[0]
  
  console.log(`Race ended. Winner: ${winner.name}`)
  
  room.players.forEach((player, id) => {
    if (id !== winner.playerId) {
      player.eliminated = true
    }
  })
  
  io.to(roomId).emit('tug-race-end', {
    winner: winner,
    results: race.completions,
    eliminatedCount: room.players.size - 1
  })
  
  room.tugOfWarRace = null
  room.tugOfWarStarted = false
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})