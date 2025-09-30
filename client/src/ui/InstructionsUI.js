// client/src/ui/InstructionsUI.js

function createRLGLInstructions() {
    const overlay = document.createElement('div')
    overlay.id = 'rlgl-instructions'
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 30px;
        border-radius: 15px;
        color: white;
        font-family: monospace;
        text-align: center;
        z-index: 2000;
        border: 3px solid #4ecdc4;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-sizing: border-box;
    `
    
    overlay.innerHTML = `
        <h1 style="
            margin: 0 0 20px 0;
            font-size: clamp(24px, 6vw, 48px);
            color: #4ecdc4;
        ">RED LIGHT, GREEN LIGHT</h1>
        
        <div style="font-size: clamp(14px, 3vw, 18px); line-height: 1.6; text-align: left;">
            <p><strong style="color: #4ecdc4;">OBJECTIVE:</strong> Reach finish without getting caught</p>
            
            <p><strong style="color: #87CEEB;">🟢 GREEN LIGHT:</strong> Move forward</p>
            <p style="margin-left: 15px;">• <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">W A S D</kbd> to move</p>
            <p style="margin-left: 15px;">• <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">SHIFT</kbd> to sprint</p>
            
            <p><strong style="color: #ffaaaa;">🔴 RED LIGHT:</strong> FREEZE!</p>
            <p style="margin-left: 15px;">• Don't move AT ALL</p>
            <p style="margin-left: 15px;">• Movement = ELIMINATION</p>
            
            <p style="margin-top: 25px; text-align: center; font-size: 0.9em; color: #888;">
                Press any key or tap to continue
            </p>
        </div>
    `
    
    document.body.appendChild(overlay)
    
    return new Promise((resolve) => {
        const handleClick = (e) => {
            e.preventDefault()
            cleanup()
        }
        
        const handleKey = (e) => {
            e.preventDefault()
            cleanup()
        }
        
        const cleanup = () => {
            overlay.removeEventListener('click', handleClick)
            overlay.removeEventListener('touchstart', handleClick)
            document.removeEventListener('keydown', handleKey)
            overlay.remove()
            resolve()
        }
        
        overlay.addEventListener('click', handleClick)
        overlay.addEventListener('touchstart', handleClick)
        document.addEventListener('keydown', handleKey)
    })
}

function createTugOfWarInstructions() {
    const overlay = document.createElement('div')
    overlay.id = 'tug-instructions'
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 30px;
        border-radius: 15px;
        color: white;
        font-family: monospace;
        text-align: center;
        z-index: 2000;
        border: 3px solid #4ecdc4;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-sizing: border-box;
    `
    
    overlay.innerHTML = `
        <h1 style="
            margin: 0 0 20px 0;
            font-size: clamp(24px, 6vw, 48px);
            color: #4ecdc4;
        ">TUG OF WAR</h1>
        
        <div style="font-size: clamp(14px, 3vw, 18px); line-height: 1.6; text-align: left;">
            <p><strong style="color: #4ecdc4;">OBJECTIVE:</strong> Type faster than opponents</p>
            
            <p><strong style="color: #4ecdc4;">HOW TO PLAY:</strong></p>
            <p style="margin-left: 15px;">1. Paragraph appears</p>
            <p style="margin-left: 15px;">2. Type each word exactly</p>
            <p style="margin-left: 15px;">3. Press <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">SPACE</kbd> after each word</p>
            <p style="margin-left: 15px;">4. <strong style="color: #ff6b6b;">Include punctuation!</strong></p>
            
            <p><strong style="color: #87CEEB;">WINNER:</strong> First to complete</p>
            <p><strong style="color: #ff6b6b;">LOSERS:</strong> Eliminated</p>
            
            <p style="margin-top: 25px; text-align: center; font-size: 0.9em; color: #888;">
                Press any key or tap to continue
            </p>
        </div>
    `
    
    document.body.appendChild(overlay)
    
    return new Promise((resolve) => {
        const handleClick = (e) => {
            e.preventDefault()
            cleanup()
        }
        
        const handleKey = (e) => {
            e.preventDefault()
            cleanup()
        }
        
        const cleanup = () => {
            overlay.removeEventListener('click', handleClick)
            overlay.removeEventListener('touchstart', handleClick)
            document.removeEventListener('keydown', handleKey)
            overlay.remove()
            resolve()
        }
        
        overlay.addEventListener('click', handleClick)
        overlay.addEventListener('touchstart', handleClick)
        document.addEventListener('keydown', handleKey)
    })
}

export { createRLGLInstructions, createTugOfWarInstructions }