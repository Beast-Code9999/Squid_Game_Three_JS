// client/src/game/tugofwar/typingUI.js

let container = null
let paragraphDisplay = null
let currentWordDisplay = null
let inputField = null
let progressBar = null
let progressFill = null
let currentParagraph = ''
let words = []
let displayWords = []
let currentWordIndex = 0
let completedWords = []
let startTime = null
let onCompleteCallback = null
let typingActive = false
let networkManager = null

function createTypingUI(onComplete, netManager) {
    onCompleteCallback = onComplete
    networkManager = netManager
    
    container = document.createElement('div')
    container.id = 'typing-ui'
    container.style.cssText = `
        position: fixed;
        bottom: 5%;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        max-width: 800px;
        max-height: 40vh;
        background: rgba(0, 0, 0, 0.85);
        padding: 15px;
        border-radius: 10px;
        color: white;
        font-family: monospace;
        z-index: 100;
        display: none;
        overflow: hidden;
    `
    
    paragraphDisplay = document.createElement('div')
    paragraphDisplay.style.cssText = `
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        max-height: 20vh;
        overflow-y: auto;
        overflow-x: hidden;
        word-wrap: break-word;
        color: #888;
    `
    
    currentWordDisplay = document.createElement('div')
    currentWordDisplay.style.cssText = `
        font-size: 20px;
        text-align: center;
        padding: 10px;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        font-weight: bold;
        letter-spacing: 1px;
    `
    
    inputField = document.createElement('input')
    inputField.type = 'text'
    inputField.placeholder = 'Type the word above and press SPACE'
    inputField.style.cssText = `
        width: 80%;
        margin: 0 auto;
        display: block;
        padding: 10px;
        font-size: 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #4ecdc4;
        border-radius: 5px;
        color: white;
        font-family: monospace;
        box-sizing: border-box;
        text-align: center;
    `
    
    progressBar = document.createElement('div')
    progressBar.style.cssText = `
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        margin-top: 10px;
        overflow: hidden;
    `
    
    progressFill = document.createElement('div')
    progressFill.style.cssText = `
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #4ecdc4, #44a8a8);
        transition: width 0.3s;
    `
    
    const style = document.createElement('style')
    style.textContent = `
        #typing-ui div::-webkit-scrollbar {
            width: 6px;
        }
        #typing-ui div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        #typing-ui div::-webkit-scrollbar-thumb {
            background: #4ecdc4;
            border-radius: 3px;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `
    document.head.appendChild(style)
    
    progressBar.appendChild(progressFill)
    container.appendChild(paragraphDisplay)
    container.appendChild(currentWordDisplay)
    container.appendChild(inputField)
    container.appendChild(progressBar)
    
    document.body.appendChild(container)
    
    inputField.addEventListener('input', handleTypingInput)
    inputField.addEventListener('keydown', handleKeyDown)
}

function handleKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        
        const typed = inputField.value.trim()
        const targetWord = words[currentWordIndex]
        
        if (typed === targetWord) {
            completedWords.push(targetWord)
            currentWordIndex++
            inputField.value = ''
            
            const percentage = (currentWordIndex / words.length) * 100
            const elapsed = (Date.now() - startTime) / 1000
            const wpm = Math.round((currentWordIndex / elapsed) * 60)
            
            if (networkManager) {
                networkManager.sendTypingProgress(currentWordIndex, percentage, wpm)
            }
            
            // Update local progress UI
            if (window.updateTugProgress) {
                window.updateTugProgress(percentage)
            }
            
            if (currentWordIndex >= words.length) {
                completeTyping()
            } else {
                updateDisplay()
            }
        } else {
            inputField.style.borderColor = '#ff6b6b'
            inputField.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'
            
            inputField.style.animation = 'shake 0.3s'
            setTimeout(() => {
                inputField.style.animation = ''
            }, 300)
            
            setTimeout(() => {
                inputField.style.borderColor = '#4ecdc4'
                inputField.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }, 800)
        }
    } else if (e.key === 'Backspace') {
        return
    }
}

function handleTypingInput(e) {
    const typed = e.target.value
    const targetWord = words[currentWordIndex]
    if (!targetWord) return
    
    const isCorrectSoFar = targetWord.startsWith(typed)
    
    if (typed.length === 0) {
        inputField.style.borderColor = '#4ecdc4'
        inputField.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
    } else if (isCorrectSoFar) {
        inputField.style.borderColor = '#4ecdc4'
        inputField.style.backgroundColor = 'rgba(78, 205, 196, 0.1)'
    } else {
        inputField.style.borderColor = '#ff6b6b'
        inputField.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'
    }
    
    let display = ''
    for (let i = 0; i < targetWord.length; i++) {
        if (i < typed.length) {
            if (typed[i] === targetWord[i]) {
                display += `<span style="color: #4ecdc4">${targetWord[i]}</span>`
            } else {
                display += `<span style="color: #ff6b6b">${targetWord[i]}</span>`
            }
        } else {
            display += `<span style="color: white">${targetWord[i]}</span>`
        }
    }
    currentWordDisplay.innerHTML = display
}

function updateDisplay() {
    let html = ''
    for (let i = 0; i < displayWords.length; i++) {
        if (i < currentWordIndex) {
            html += `<span style="color: #4ecdc4; font-weight: bold">${displayWords[i]}</span> `
        } else if (i === currentWordIndex) {
            html += `<span style="background: rgba(78, 205, 196, 0.2); padding: 2px 4px; border-radius: 3px; color: white; font-weight: bold">${displayWords[i]}</span> `
        } else {
            html += `<span style="color: #666">${displayWords[i]}</span> `
        }
    }
    paragraphDisplay.innerHTML = html
    
    if (words[currentWordIndex]) {
        currentWordDisplay.innerHTML = `<span style="color: white">${words[currentWordIndex]}</span>`
    }
    
    const progress = (currentWordIndex / words.length) * 100
    progressFill.style.width = `${progress}%`
    
    const currentWordElement = paragraphDisplay.querySelector('span[style*="background"]')
    if (currentWordElement) {
        currentWordElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}

function startTyping(paragraph) {
    if (typingActive) return
    typingActive = true

    currentParagraph = paragraph.trim()

    displayWords = currentParagraph
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(w => w.length > 0)

    words = displayWords.slice()

    currentWordIndex = 0
    completedWords = []
    startTime = Date.now()
    inputField.value = ''
    inputField.disabled = false
    container.style.display = 'block'
    
    updateDisplay()
    inputField.focus()
}

function completeTyping() {
    typingActive = false
    const timeTaken = (Date.now() - startTime) / 1000
    const wpm = Math.round((words.length / timeTaken) * 60)
    
    inputField.disabled = true
    currentWordDisplay.innerHTML = '<span style="color: #4ecdc4">COMPLETED!</span>'
    
    if (networkManager) {
        networkManager.sendTypingComplete(timeTaken, wpm)
    }
    
    // Update local progress to 100%
    if (window.updateTugProgress) {
        window.updateTugProgress(100)
    }
    
    if (onCompleteCallback) {
        onCompleteCallback({
            time: timeTaken,
            wpm: wpm
        })
    }
}

function hideTypingUI() {
    if (container) container.style.display = 'none'
}

function destroyTypingUI() {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container)
    }
}

export { createTypingUI, startTyping, hideTypingUI, destroyTypingUI }