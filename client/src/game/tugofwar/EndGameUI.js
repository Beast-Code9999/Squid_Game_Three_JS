// client/src/game/tugofwar/EndGameUI.js

let endGameContainer = null

function createEndGameUI(isWinner, winnerData, loserData, stats) {
    // Remove existing if any
    if (endGameContainer) {
        removeEndGameUI()
    }
    
    endGameContainer = document.createElement('div')
    endGameContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.5s ease-in;
    `
    
    const style = document.createElement('style')
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes victoryPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes defeatShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `
    document.head.appendChild(style)
    
    // Main result banner
    const banner = document.createElement('div')
    banner.style.cssText = `
        font-size: 72px;
        font-weight: bold;
        font-family: 'Impact', sans-serif;
        text-align: center;
        margin-bottom: 40px;
        animation: ${isWinner ? 'victoryPulse' : 'defeatShake'} 2s infinite;
        text-shadow: 0 0 20px ${isWinner ? '#ffd700' : '#ff0000'};
        color: ${isWinner ? '#ffd700' : '#ff6b6b'};
    `
    banner.textContent = isWinner ? '🏆 VICTORY!' : '💀 DEFEATED'
    
    // Stats container
    const statsContainer = document.createElement('div')
    statsContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        padding: 30px 50px;
        border-radius: 15px;
        border: 3px solid ${isWinner ? '#ffd700' : '#ff6b6b'};
        margin-bottom: 30px;
    `
    
    statsContainer.innerHTML = `
        <div style="color: white; font-family: monospace; font-size: 24px; text-align: center;">
            <div style="margin-bottom: 20px; font-size: 32px; color: #4ecdc4;">
                Winner: ${winnerData.name}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <div style="color: #888; font-size: 16px;">Time</div>
                    <div style="font-size: 28px; color: ${isWinner ? '#4ecdc4' : '#ff6b6b'};">
                        ${winnerData.time.toFixed(2)}s
                    </div>
                </div>
                <div>
                    <div style="color: #888; font-size: 16px;">WPM</div>
                    <div style="font-size: 28px; color: ${isWinner ? '#4ecdc4' : '#ff6b6b'};">
                        ${winnerData.wpm}
                    </div>
                </div>
            </div>
            ${stats.eliminatedCount > 0 ? `
                <div style="margin-top: 20px; color: #666; font-size: 18px;">
                    ${stats.eliminatedCount} players eliminated
                </div>
            ` : ''}
        </div>
    `
    
    // Buttons container
    const buttonsContainer = document.createElement('div')
    buttonsContainer.style.cssText = `
        display: flex;
        gap: 20px;
        margin-top: 20px;
    `
    
    // Play Again button
    const playAgainBtn = document.createElement('button')
    playAgainBtn.textContent = 'Play Again'
    playAgainBtn.style.cssText = `
        padding: 15px 40px;
        font-size: 20px;
        font-family: monospace;
        background: #4ecdc4;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
    `
    playAgainBtn.onmouseover = () => {
        playAgainBtn.style.background = '#44a8a8'
        playAgainBtn.style.transform = 'scale(1.05)'
    }
    playAgainBtn.onmouseout = () => {
        playAgainBtn.style.background = '#4ecdc4'
        playAgainBtn.style.transform = 'scale(1)'
    }
    playAgainBtn.onclick = () => {
        window.location.reload()
    }
    
    // Exit button (optional)
    const exitBtn = document.createElement('button')
    exitBtn.textContent = 'Exit'
    exitBtn.style.cssText = `
        padding: 15px 40px;
        font-size: 20px;
        font-family: monospace;
        background: #666;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
    `
    exitBtn.onmouseover = () => {
        exitBtn.style.background = '#555'
        exitBtn.style.transform = 'scale(1.05)'
    }
    exitBtn.onmouseout = () => {
        exitBtn.style.background = '#666'
        exitBtn.style.transform = 'scale(1)'
    }
    exitBtn.onclick = () => {
        window.close()
    }
    
    buttonsContainer.appendChild(playAgainBtn)
    buttonsContainer.appendChild(exitBtn)
    
    endGameContainer.appendChild(banner)
    endGameContainer.appendChild(statsContainer)
    endGameContainer.appendChild(buttonsContainer)
    
    document.body.appendChild(endGameContainer)
}

function removeEndGameUI() {
    if (endGameContainer && endGameContainer.parentNode) {
        endGameContainer.parentNode.removeChild(endGameContainer)
        endGameContainer = null
    }
}

export { createEndGameUI, removeEndGameUI }