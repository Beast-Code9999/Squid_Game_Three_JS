// client/src/game/tugofwar/ProgressUI.js

let leftProgressContainer = null
let rightProgressContainer = null

function createProgressUI() {
    // Left player progress (top-left)
    leftProgressContainer = document.createElement('div')
    leftProgressContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 50;
    `
    
    leftProgressContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
                width: 50px;
                height: 50px;
                background: #4ecdc4;
                border-radius: 50%;
                border: 3px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 20px;
            " id="left-player-icon">P1</div>
            <div>
                <div style="color: white; font-size: 16px; font-family: monospace; margin-bottom: 5px;" id="left-player-name">You</div>
                <div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                    <div id="left-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4ecdc4, #44ffaa); transition: width 0.3s;"></div>
                </div>
            </div>
        </div>
    `
    
    // Right player progress (top-right)
    rightProgressContainer = document.createElement('div')
    rightProgressContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 50;
    `
    
    rightProgressContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex-direction: row-reverse;">
            <div style="
                width: 50px;
                height: 50px;
                background: #ff6b6b;
                border-radius: 50%;
                border: 3px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 20px;
            " id="right-player-icon">P2</div>
            <div style="text-align: right;">
                <div style="color: white; font-size: 16px; font-family: monospace; margin-bottom: 5px;" id="right-player-name">Opponent</div>
                <div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                    <div id="right-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff6b6b, #ff4444); transition: width 0.3s;"></div>
                </div>
            </div>
        </div>
    `
    
    document.body.appendChild(leftProgressContainer)
    document.body.appendChild(rightProgressContainer)
}

function updateProgressUI(leftProgress, rightProgress) {
    const leftFill = document.getElementById('left-progress-fill')
    const rightFill = document.getElementById('right-progress-fill')
    
    if (leftFill) leftFill.style.width = `${leftProgress}%`
    if (rightFill) rightFill.style.width = `${rightProgress}%`
}

function setPlayerNames(leftName, rightName) {
    const leftNameEl = document.getElementById('left-player-name')
    const rightNameEl = document.getElementById('right-player-name')
    
    if (leftNameEl) leftNameEl.textContent = leftName
    if (rightNameEl) rightNameEl.textContent = rightName
}

function removeProgressUI() {
    if (leftProgressContainer && leftProgressContainer.parentNode) {
        leftProgressContainer.parentNode.removeChild(leftProgressContainer)
        leftProgressContainer = null
    }
    if (rightProgressContainer && rightProgressContainer.parentNode) {
        rightProgressContainer.parentNode.removeChild(rightProgressContainer)
        rightProgressContainer = null
    }
}

export { createProgressUI, updateProgressUI, setPlayerNames, removeProgressUI }