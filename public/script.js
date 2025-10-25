// public/script.js
// Simplified version for Netlify Functions with individual prompt cards

// Add AI message to chat
function addAIMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message to chat
function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add multiple prompts with individual copy buttons
function addPromptsOutput(prompts) {
    const chatMessages = document.getElementById('chatMessages');
    
    prompts.forEach((promptData, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const promptContainer = document.createElement('div');
        promptContainer.className = 'prompt-output-container';
        
        // Add prompt title and description
        const headerDiv = document.createElement('div');
        headerDiv.style.marginBottom = '12px';
        headerDiv.innerHTML = `
            <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">
                ${promptData.title || `프롬프트 ${index + 1}`}
            </div>
            ${promptData.description ? `<div style="font-size: 13px; color: #B0B0B0;">${promptData.description}</div>` : ''}
        `;
        
        const promptDiv = document.createElement('div');
        promptDiv.className = 'prompt-output';
        promptDiv.textContent = promptData.prompt;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = '복사';
        copyButton.onclick = () => copyPrompt(promptData.prompt, copyButton);
        
        promptContainer.appendChild(copyButton);
        promptContainer.appendChild(headerDiv);
        promptContainer.appendChild(promptDiv);
        messageDiv.appendChild(promptContainer);
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Copy prompt to clipboard
function copyPrompt(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = '복사됨!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '복사';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('복사 실패:', err);
        button.textContent = '실패';
    });
}

// Add loading indicator
function addLoadingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message loading';
    messageDiv.id = 'loadingMessage';
    messageDiv.innerHTML = `
        <span>프롬프트 생성 중</span>
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove loading indicator
function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Generate prompt using Gemini API via Netlify Function
async function generatePrompt(userMessage, mode = 'creation') {
    try {
        addLoadingMessage();
        
        const response = await fetch('/.netlify/functions/generate-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userMessage: userMessage,
                mode: mode
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.message || '프롬프트 생성 실패');
        }
        
        const data = await response.json();
        removeLoadingMessage();
        
        if (data.prompts && Array.isArray(data.prompts)) {
            addAIMessage(`${data.prompts.length}개의 전문가급 프롬프트가 생성되었습니다! 🎬`);
            addPromptsOutput(data.prompts);
        } else {
            // Fallback for old format
            addAIMessage('전문가급 프롬프트가 생성되었습니다! 🎬');
            addPromptsOutput([{
                title: "생성된 프롬프트",
                description: "",
                prompt: data.prompt || JSON.stringify(data)
            }]);
        }
        
    } catch (error) {
        console.error('프롬프트 생성 오류:', error);
        removeLoadingMessage();
        addAIMessage(`프롬프트 생성 중 오류가 발생했습니다: ${error.message}`);
    }
}

// Handle send button click
async function handleSend() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    userInput.value = '';
    
    // Disable input while processing
    sendButton.disabled = true;
    userInput.disabled = true;
    
    // Generate prompt
    await generatePrompt(message);
    
    // Re-enable input
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    
    sendButton.addEventListener('click', handleSend);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    // Show welcome message
    addAIMessage('안녕하세요! 👋<br><br>어떤 영상 프롬프트를 만들어드릴까요?<br>간단한 아이디어만 말씀해주세요. 전문가급 프롬프트로 변환해드립니다.');
});

