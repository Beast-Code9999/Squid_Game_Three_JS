const isDevelopment = window.location.hostname === 'localhost'

export const SOCKET_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://squid-game-three-js-server.onrender.com'