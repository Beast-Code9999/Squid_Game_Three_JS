# Squid Game - Multiplayer Browser Game

A real-time 3D multiplayer browser game inspired by Netflix's Squid Game series. Built entirely with web technologies - no downloads or installations required for players!

## Features

- **Real-time Multiplayer**: 2-6 players compete simultaneously
- **Two Game Modes**:
  - **Red Light Green Light**: Freeze when the doll turns around or get eliminated
  - **Tug of War**: Type as fast as you can to win
- **3D Graphics**: Smooth 3D rendering using Three.js
- **AI Bots**: 15 AI opponents with realistic behavior
- **Cross-Browser**: Works on Chrome, Firefox, Edge, and Opera

## Play Now

**Live Demo**: [https://stirring-semolina-c2bcc33.netlify.app/](https://stirring-semolina-c2bcc33.netlify.app/)

No installation needed - just click and play!

## Tech Stack

**Frontend:**
- Three.js (3D graphics)
- Vanilla JavaScript
- Vite (build tool)

**Backend:**
- Node.js
- Express
- Socket.io (WebSocket communication)

## Running Locally

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Beast-Code9999/Squid_Game_Three_JS.git
cd Squid_Game_Three_JS
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
```
http://localhost:5173
```

The game should now be running locally on your machine!

### Running Backend Server (Optional)

If you want to run your own game server instead of using the deployed one:

1. **Navigate to server directory**
```bash
cd server
```

2. **Install server dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Update client configuration**

In `client/src/config.js`, change the server URL to:
```javascript
const SERVER_URL = 'http://localhost:3000';
```

The server will run on `http://localhost:3000`

## How to Play

### Red Light Green Light
1. Move forward when you hear "Green Light"
2. **STOP** completely when you hear "Red Light"
3. Any movement during red light = elimination
4. First to reach the finish line wins!

### Tug of War
1. Type the displayed text as fast and accurately as possible
2. Every correct character pulls the rope
3. Mistakes don't count - keep typing!
4. First team to pull the rope to their side wins!

## Project Structure
```
Squid_Game_Three_JS/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── main.js        # Entry point
│   │   ├── game/          # Game logic
│   │   ├── scenes/        # Three.js scenes
│   │   └── utils/         # Helper functions
│   └── index.html
│
├── server/                 # Backend server
│   ├── server.js          # Socket.io server
│   └── gameLogic.js       # Game state management
│
└── assets/                 # 3D models, textures, sounds
```

## Academic Project

This project was developed as part of the ENG303 Bachelor of Computer Science program at Charles Darwin University.

**Research Focus:**
- Browser-based 3D multiplayer game performance
- Real-time networking with WebSockets
- Client-server architecture with client-side prediction

## License

This project is for educational purposes. Assets and game concept inspired by Netflix's Squid Game.

## Author

**Jason Khung Siong Lay**
- GitHub: [@Beast-Code9999](https://github.com/Beast-Code9999)
- Institution: Charles Darwin University

## Acknowledgments

- Supervisor: Dr. Reem Sherif
- Three.js community
- Socket.io documentation
- Netflix's Squid Game for inspiration

---

**⭐ If you found this project interesting, please give it a star!**