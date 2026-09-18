// Gini Advisory Assistant JavaScript

// Initialize markdown parser
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true
});

document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    updateSessionInfo();
});

function initializeChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // Send message on button click
    sendButton.addEventListener('click', function() {
        sendMessage();
    });

    // Send message on Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Auto-scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;

        // Add user message
        addMessage(message, 'user');
        messageInput.value = '';

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.innerHTML = '<div class="message-avatar"><span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span></div><div class="message-content"><p>Thinking...</p></div>';
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();

        // Generate bot response (now async via API)
        const response = generateResponse(message);
        if (response === null) {
            // Remove loading indicator when async response arrives
            setTimeout(() => {
                if (loadingDiv.parentNode) {
                    loadingDiv.remove();
                }
            }, 500);
        }
    }

    // Add message to chat
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        if (type === 'bot') {
            avatarDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
            </svg>`;
        } else {
            avatarDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>`;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Parse markdown for bot messages, plain text for user messages
        if (type === 'bot') {
            const htmlContent = md.render(content);
            contentDiv.innerHTML = htmlContent;
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        scrollToBottom();
    }

    // Generate bot response through backend proxy so API keys stay server-side
    function generateResponse(message) {
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are Gini, an expert financial advisor specializing in Indian finance and wealth management. Provide practical, actionable financial guidance. Keep responses conversational and helpful.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.reply) {
                const aiResponse = data.reply;
                addMessage(aiResponse, 'bot');
            } else if (data.error) {
                addMessage(`AI Error: ${data.error}`, 'bot');
            } else {
                addMessage('Unable to generate response. Please try again.', 'bot');
            }
        })
        .catch(error => {
            console.error('Chat API Error:', error);
            addMessage('I encountered an issue connecting to AI service. Please check your internet connection and try again.', 'bot');
        });

        // Return placeholder immediately while API call happens
        return null; // Message will be added via async API call
    }

    // Make sendMessage and addMessage available globally for quick actions
    window.sendMessage = sendMessage;
    window.addMessage = addMessage;
}

function sendQuickMessage(message) {
    document.getElementById('message-input').value = message;
    document.getElementById('send-button').click();
}

function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    // Keep only the initial bot message
    const initialMessage = chatMessages.querySelector('.message');
    chatMessages.innerHTML = '';
    if (initialMessage) {
        chatMessages.appendChild(initialMessage);
    }
    updateSessionInfo();
}

function updateSessionInfo() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('session-start-time').textContent = timeString;
}

// Add some initial demo messages for better UX
setTimeout(() => {
    if (document.querySelectorAll('.message').length === 1) { // Only initial message
        const demoMessages = [
            "Feel free to ask me about any financial topic!",
            "I can help with investment planning, tax strategies, and retirement goals.",
            "Try the quick action buttons on the right for common topics."
        ];
        demoMessages.forEach((msg, index) => {
            setTimeout(() => {
                addMessage(msg, 'bot');
            }, (index + 1) * 2000);
        });
    }
}, 3000);