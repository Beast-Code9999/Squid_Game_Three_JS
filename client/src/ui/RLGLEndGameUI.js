// client/src/ui/RLGLEndGameUI.js

/**
 * Creates the defeated popup for RLGL when player moves during red light
 */
export function createRLGLDefeatedUI() {
    // Remove any existing popup
    removeRLGLEndGameUI()
    
    const overlay = document.createElement('div')
    overlay.id = 'rlgl-end-overlay'
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-in-out;
    `
    
    const card = document.createElement('div')
    card.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 60px 80px;
        border-radius: 20px;
        text-align: center;
        border: 3px solid #ff6b6b;
        box-shadow: 0 20px 60px rgba(255, 107, 107, 0.4);
        animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `
    
    const title = document.createElement('h1')
    title.textContent = 'ELIMINATED'
    title.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 56px;
        color: #ff6b6b;
        font-family: 'Arial Black', sans-serif;
        text-transform: uppercase;
        letter-spacing: 4px;
        text-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
    `
    
    const message = document.createElement('p')
    message.textContent = 'You moved during red light!'
    message.style.cssText = `
        margin: 0 0 40px 0;
        font-size: 24px;
        color: #ffffff;
        font-family: 'Courier New', monospace;
    `
    
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
        display: flex;
        gap: 20px;
        justify-content: center;
    `
    
    const replayButton = document.createElement('button')
    replayButton.textContent = 'REPLAY'
    replayButton.style.cssText = `
        padding: 15px 40px;
        font-size: 20px;
        font-family: 'Arial Black', sans-serif;
        background: linear-gradient(135deg, #4ecdc4 0%, #44a3a0 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
    `
    
    replayButton.addEventListener('mouseenter', () => {
        replayButton.style.transform = 'translateY(-3px)'
        replayButton.style.boxShadow = '0 8px 20px rgba(78, 205, 196, 0.6)'
    })
    
    replayButton.addEventListener('mouseleave', () => {
        replayButton.style.transform = 'translateY(0)'
        replayButton.style.boxShadow = '0 5px 15px rgba(78, 205, 196, 0.4)'
    })
    
    replayButton.addEventListener('click', () => {
        window.location.reload()
    })
    
    const exitButton = document.createElement('button')
    exitButton.textContent = 'EXIT'
    exitButton.style.cssText = `
        padding: 15px 40px;
        font-size: 20px;
        font-family: 'Arial Black', sans-serif;
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 5px 15px rgba(149, 165, 166, 0.4);
    `
    
    exitButton.addEventListener('mouseenter', () => {
        exitButton.style.transform = 'translateY(-3px)'
        exitButton.style.boxShadow = '0 8px 20px rgba(149, 165, 166, 0.6)'
    })
    
    exitButton.addEventListener('mouseleave', () => {
        exitButton.style.transform = 'translateY(0)'
        exitButton.style.boxShadow = '0 5px 15px rgba(149, 165, 166, 0.4)'
    })
    
    exitButton.addEventListener('click', () => {
        window.close()
    })
    
    buttonContainer.appendChild(replayButton)
    buttonContainer.appendChild(exitButton)
    
    card.appendChild(title)
    card.appendChild(message)
    card.appendChild(buttonContainer)
    
    overlay.appendChild(card)
    document.body.appendChild(overlay)
    
    // Add CSS animations
    const style = document.createElement('style')
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.5);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `
    document.head.appendChild(style)
}

/**
 * Creates the victory popup for RLGL when player finishes successfully
 */
export function createRLGLVictoryUI() {
    // Remove any existing popup
    removeRLGLEndGameUI()
    
    const overlay = document.createElement('div')
    overlay.id = 'rlgl-end-overlay'
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-in-out;
    `
    
    const card = document.createElement('div')
    card.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 60px 80px;
        border-radius: 20px;
        text-align: center;
        border: 3px solid #4ecdc4;
        box-shadow: 0 20px 60px rgba(78, 205, 196, 0.4);
        animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `
    
    const title = document.createElement('h1')
    title.textContent = 'VICTORY!'
    title.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 56px;
        color: #4ecdc4;
        font-family: 'Arial Black', sans-serif;
        text-transform: uppercase;
        letter-spacing: 4px;
        text-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
    `
    
    const message = document.createElement('p')
    message.textContent = 'You survived Red Light Green Light!'
    message.style.cssText = `
        margin: 0 0 40px 0;
        font-size: 24px;
        color: #ffffff;
        font-family: 'Courier New', monospace;
    `
    
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
        display: flex;
        gap: 20px;
        justify-content: center;
    `
    
    const continueButton = document.createElement('button')
    continueButton.textContent = 'CONTINUE'
    continueButton.style.cssText = `
        padding: 15px 40px;
        font-size: 20px;
        font-family: 'Arial Black', sans-serif;
        background: linear-gradient(135deg, #4ecdc4 0%, #44a3a0 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
    `
    
    continueButton.addEventListener('mouseenter', () => {
        continueButton.style.transform = 'translateY(-3px)'
        continueButton.style.boxShadow = '0 8px 20px rgba(78, 205, 196, 0.6)'
    })
    
    continueButton.addEventListener('mouseleave', () => {
        continueButton.style.transform = 'translateY(0)'
        continueButton.style.boxShadow = '0 5px 15px rgba(78, 205, 196, 0.4)'
    })
    
    continueButton.addEventListener('click', () => {
        removeRLGLEndGameUI()
        // The game will automatically transition to Tug of War when all players finish
    })
    
    buttonContainer.appendChild(continueButton)
    
    card.appendChild(title)
    card.appendChild(message)
    card.appendChild(buttonContainer)
    
    overlay.appendChild(card)
    document.body.appendChild(overlay)
    
    // Add CSS animations
    const style = document.createElement('style')
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.5);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `
    document.head.appendChild(style)
}

/**
 * Removes any existing RLGL end game UI
 */
export function removeRLGLEndGameUI() {
    const existing = document.getElementById('rlgl-end-overlay')
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing)
    }
}