// client/src/ui/ReadyUI.js
function createReadyUI() {
  const container = document.createElement('div')
  container.id = 'ready-ui'
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 100;
  `
  
  const readyButton = document.createElement('button')
  readyButton.id = 'ready-btn'
  readyButton.textContent = 'READY'
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
  readyStatus.id = 'ready-status'
  readyStatus.style.cssText = `
    color: white;
    font-size: 18px;
    margin-top: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  `
  readyStatus.textContent = 'Waiting for players...'
  
  const countdownDisplay = document.createElement('div')
  countdownDisplay.id = 'countdown'
  countdownDisplay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 120px;
    font-weight: bold;
    color: white;
    text-shadow: 4px 4px 8px rgba(0,0,0,0.8);
    display: none;
    animation: pulse 1s ease-in-out;
  `
  
  // Add pulse animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.1); }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
  `
  document.head.appendChild(style)
  
  container.appendChild(readyButton)
  container.appendChild(readyStatus)
  document.body.appendChild(container)
  document.body.appendChild(countdownDisplay)
  
  return { container, readyButton, readyStatus, countdownDisplay }
}

export { createReadyUI }