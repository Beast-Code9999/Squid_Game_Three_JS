// client/src/ui/TugReadyUI.js

let tugReadyContainer = null

function createTugReadyUI() {
    // If container already exists, don't create another one
    if (tugReadyContainer) {
        return { 
            container: tugReadyContainer, 
            readyButton: document.getElementById('tug-ready-btn'),
            readyStatus: document.getElementById('tug-ready-status')
        }
    }
    
    const container = document.createElement('div')
    container.id = 'tug-ready-ui'
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        z-index: 100;
    `
    
    const readyButton = document.createElement('button')
    readyButton.id = 'tug-ready-btn'
    readyButton.textContent = 'READY TO TYPE'
    readyButton.style.cssText = `
        padding: 15px 40px;
        font-size: 24px;
        background: #4ecdc4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `
    
    readyButton.onmouseover = () => {
        readyButton.style.transform = 'scale(1.05)'
    }
    readyButton.onmouseout = () => {
        readyButton.style.transform = 'scale(1)'
    }
    
    const readyStatus = document.createElement('div')
    readyStatus.id = 'tug-ready-status'
    readyStatus.style.cssText = `
        color: white;
        font-size: 18px;
        margin-top: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `
    readyStatus.textContent = 'Waiting for players...'
    
    container.appendChild(readyButton)
    container.appendChild(readyStatus)
    document.body.appendChild(container)
    
    tugReadyContainer = container
    
    return { container, readyButton, readyStatus }
}

function removeTugReadyUI() {
    const container = document.getElementById('tug-ready-ui')
    if (container && container.parentNode) {
        container.parentNode.removeChild(container)
        tugReadyContainer = null
    }
}

export { createTugReadyUI, removeTugReadyUI }