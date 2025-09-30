// client/src/networking/NetworkManager.js
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/env.js'

class NetworkManager {
  constructor() {
    this.socket = null
    this.connected = false
    this.roomId = null
    this.playerId = null
    this.players = new Map()
    
    // RLGL Callbacks
    this.onGameStart = null
    this.onCountdown = null
    this.onReadyUpdate = null
    this.onWaitForPlayers = null
    this.onRLGLCompletionUpdate = null
    this.onAllPlayersReadyTug = null
    
    // Tug of War Callbacks
    this.onTugRaceStart = null
    this.onRaceProgress = null
    this.onPlayerFinished = null
    this.onTugRaceEnd = null
    this.onTugReadyUpdate = null
    this.onTugTypingStart = null
  }

  connect() {
    this.socket = io(SOCKET_URL)

    // ========== CONNECTION EVENTS ==========
    
    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.connected = true
      this.socket.emit('join-game', { name: `Player${Math.floor(Math.random() * 1000)}` })
    })

    this.socket.on('joined-room', (data) => {
      this.roomId = data.roomId
      this.playerId = data.playerId
      console.log(`Joined room ${this.roomId}`)
      
      // Add existing players
      data.players.forEach(player => {
        if (player.id !== this.playerId) {
          this.players.set(player.id, player)
        }
      })
    })

    this.socket.on('player-joined', (player) => {
      this.players.set(player.id, player)
      console.log(`${player.name} joined`)
    })

    this.socket.on('player-left', (data) => {
      this.players.delete(data.id)
      console.log(`Player ${data.id} left`)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.connected = false
    })

    // ========== RLGL EVENTS ==========
    
    this.socket.on('player-moved', (data) => {
      const player = this.players.get(data.id)
      if (player) {
        player.position = data.position
        player.rotation = data.rotation
      }
    })
    
    this.socket.on('player-ready-update', (data) => {
      console.log(`Ready: ${data.totalReady}/${data.totalPlayers}`)
      if (this.onReadyUpdate) {
        this.onReadyUpdate(data)
      }
    })
    
    this.socket.on('countdown', (data) => {
      console.log(`Countdown: ${data.count}`)
      if (this.onCountdown) {
        this.onCountdown(data.count)
      }
    })
    
    this.socket.on('game-start', (data) => {
      console.log('Game starting for everyone!')
      if (this.onGameStart) {
        this.onGameStart(data)
      }
    })

    this.socket.on('player-eliminated', (data) => {
      const player = this.players.get(data.id)
      if (player) {
        player.eliminated = true
      }
    })

    this.socket.on('wait-for-players', (data) => {
      console.log('Waiting for other players to finish RLGL')
      if (this.onWaitForPlayers) {
        this.onWaitForPlayers(data)
      }
    })

    this.socket.on('rlgl-completion-update', (data) => {
      if (this.onRLGLCompletionUpdate) {
        this.onRLGLCompletionUpdate(data)
      }
    })

    this.socket.on('all-players-ready-tug', () => {
      console.log('All players ready for Tug of War!')
      if (this.onAllPlayersReadyTug) {
        this.onAllPlayersReadyTug()
      }
    })

    // ========== TUG OF WAR EVENTS ==========
    
    this.socket.on('tug-race-start', (data) => {
      console.log('Tug of War race starting!', data)
      if (this.onTugRaceStart) {
        this.onTugRaceStart(data)
      }
    })
    
    this.socket.on('race-progress', (data) => {
      if (this.onRaceProgress) {
        this.onRaceProgress(data)
      }
    })
    
    this.socket.on('player-finished-typing', (data) => {
      console.log(`${data.name} finished in place ${data.place}!`)
      if (this.onPlayerFinished) {
        this.onPlayerFinished(data)
      }
    })
    
    this.socket.on('tug-race-end', (data) => {
      console.log('Race ended!', data)
      if (this.onTugRaceEnd) {
        this.onTugRaceEnd(data)
      }
    })

    this.socket.on('tug-ready-update', (data) => {
      console.log(`Tug Ready: ${data.ready}/${data.total}`)
      if (this.onTugReadyUpdate) {
        this.onTugReadyUpdate(data)
      }
    })

    this.socket.on('tug-typing-start', () => {
      console.log('All players ready! Starting typing...')
      if (this.onTugTypingStart) {
        this.onTugTypingStart()
      }
    })
  }

  // ========== RLGL METHODS ==========
  
  sendPosition(position, rotation) {
    if (!this.connected) return
    this.socket.emit('player-move', { position, rotation })
  }

  sendEliminated() {
    if (!this.connected) return
    this.socket.emit('player-eliminated')
  }
  
  sendReady() {
    if (!this.connected) return
    this.socket.emit('player-ready')
  }

  sendNotReady() {
    if (!this.connected) return
    this.socket.emit('player-not-ready')
  }

  // ========== TUG OF WAR METHODS ==========
  
  sendLevelComplete(level) {
    if (!this.connected) return
    console.log(`Sending level complete: ${level}`)
    this.socket.emit('level-complete', { level })
  }
  
  sendTypingProgress(wordIndex, percentage, wpm) {
    if (!this.connected) return
    this.socket.emit('typing-progress', {
      wordIndex,
      percentage,
      wpm: wpm || 0
    })
  }
  
  sendTypingComplete(time, wpm) {
    if (!this.connected) return
    console.log('Sending typing complete', { time, wpm })
    this.socket.emit('typing-complete', { time, wpm })
  }

  sendTugReady() {
    if (!this.connected) return
    console.log('Sending tug ready')
    this.socket.emit('tug-ready')
  }

  sendTugNotReady() {
    if (!this.connected) return
    this.socket.emit('tug-not-ready')
  }
}

export { NetworkManager }