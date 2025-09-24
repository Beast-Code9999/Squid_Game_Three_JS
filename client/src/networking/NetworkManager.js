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
    
    // Callbacks
    this.onGameStart = null
    this.onCountdown = null
    this.onReadyUpdate = null
  }

  connect() {
    this.socket = io(SOCKET_URL)

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

    this.socket.on('player-moved', (data) => {
      const player = this.players.get(data.id)
      if (player) {
        player.position = data.position
        player.rotation = data.rotation
      }
    })

    this.socket.on('player-left', (data) => {
      this.players.delete(data.id)
      console.log(`Player ${data.id} left`)
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

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.connected = false
    })
  }

  sendPosition(position, rotation) {
    if (!this.connected) return
    
    this.socket.emit('player-move', {
      position,
      rotation
    })
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
}

export { NetworkManager }