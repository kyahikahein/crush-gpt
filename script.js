class CrushGPT {
    constructor() {
        // Statistics
        this.messagesSent = 0;
        this.messagesRead = 0;
        this.repliesReceived = 0;
        
        // Chat history storage
        this.chatHistory = this.loadChatHistory();
        this.currentChatId = Date.now();
        
        // DOM Elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Initialize
        this.initializeEventListeners();
        this.updateStats();
        this.addEncouragementSystem();
        this.updateChatHistoryUI();
    }

    loadChatHistory() {
        const saved = localStorage.getItem('crushgpt-chat-history');
        return saved ? JSON.parse(saved) : [];
    }

    saveChatHistory() {
        localStorage.setItem('crushgpt-chat-history', JSON.stringify(this.chatHistory));
    }

    saveCurrentChat() {
        const messages = Array.from(document.querySelectorAll('.message')).map(msg => {
            const text = msg.querySelector('.message-text')?.textContent || '';
            const time = msg.querySelector('.message-meta span')?.textContent || '';
            const isRead = msg.querySelector('.read-status')?.textContent.includes('Read') || false;
            return { text, time, read: isRead };
        });

        if (messages.length > 0) {
            const chatData = {
                id: this.currentChatId,
                timestamp: new Date().toLocaleString(),
                messageCount: this.messagesSent,
                messages: messages,
                stats: {
                    sent: this.messagesSent,
                    read: this.messagesRead,
                    replies: this.repliesReceived
                }
            };

            // Remove existing chat with same ID and add new one
            this.chatHistory = this.chatHistory.filter(chat => chat.id !== this.currentChatId);
            this.chatHistory.unshift(chatData);
            
            // Keep only last 10 chats
            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(0, 10);
            }
            
            this.saveChatHistory();
        }
    }

    updateChatHistoryUI() {
        const chatItems = document.querySelectorAll('.chat-item[data-conversation]');
        
        // Update with actual chat history
        this.chatHistory.forEach((chat, index) => {
            if (index < chatItems.length) {
                const item = chatItems[index];
                const sadEmojis = ['💬', '😢', '🙄', '😭'];
                const emoji = sadEmojis[index] || '💔';
                
                item.textContent = `${emoji} ${chat.timestamp} (${chat.messageCount} msgs)`;
                item.setAttribute('data-chat-id', chat.id);
            }
        });
        
        // Fill remaining slots with generic messages
        const remainingItems = Array.from(chatItems).slice(this.chatHistory.length);
        const genericMessages = [
            '💬 Previous Attempts',
            '😢 More Ignored Messages', 
            '🙄 Still No Response',
            '😭 Day 47 of Silence'
        ];
        
        remainingItems.forEach((item, index) => {
            if (index < genericMessages.length) {
                item.textContent = genericMessages[index];
                item.removeAttribute('data-chat-id');
            }
        });
    }

    initializeEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input handling
        this.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.sendButton.disabled = this.messageInput.value.trim() === '';
        });



        // New chat button - actually creates new chat
        document.querySelector('.new-chat-btn').addEventListener('click', () => {
            this.startNewChat();
        });

        // Past conversation clicks
        this.initializePastConversations();
    }

    initializePastConversations() {
        const pastChats = document.querySelectorAll('.chat-item[data-conversation]');
        
        pastChats.forEach(chatItem => {
            chatItem.addEventListener('click', () => {
                const chatId = chatItem.getAttribute('data-chat-id');
                
                if (chatId) {
                    // Load actual saved chat
                    this.loadSavedChat(parseInt(chatId));
                } else {
                    // Load generic past conversation
                    const conversationType = chatItem.getAttribute('data-conversation');
                    this.loadPastConversation(conversationType);
                }
                
                // Update active state
                document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
                chatItem.classList.add('active');
                
                // Reset to current chat after 15 seconds
                setTimeout(() => {
                    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
                    document.querySelector('.chat-item:first-child').classList.add('active');
                    this.loadCurrentConversation();
                }, 15000);
            });
        });
    }

    loadSavedChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;
        
        // Clear current messages
        this.messagesContainer.innerHTML = '';
        
        // Add title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'intro-message';
        titleDiv.innerHTML = `
            <div class="intro-title">📚 Chat History: ${chat.timestamp}</div>
            <p>Reliving your ${chat.stats.sent} messages of desperation</p>
            <p>All read, none replied. Classic.</p>
            <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
                Returning to current chat in 15 seconds...
            </p>
        `;
        this.messagesContainer.appendChild(titleDiv);
        
        // Add saved messages with animation
        chat.messages.forEach((msg, index) => {
            setTimeout(() => {
                this.addPastMessage(msg.text, msg.time, msg.read);
            }, index * 300);
        });
    }

    startNewChat() {
        // Save current chat first
        this.saveCurrentChat();
        
        // Reset statistics
        this.messagesSent = 0;
        this.messagesRead = 0;
        this.repliesReceived = 0;
        
        // Generate new chat ID
        this.currentChatId = Date.now();
        
        // Clear messages and show welcome screen
        this.loadCurrentConversation();
        
        // Update UI
        this.updateStats();
        this.updateChatHistoryUI();
        
        // Reset hope levels
        this.updateHopeLevel();
    }

    loadPastConversation(type) {
        // Clear current messages
        this.messagesContainer.innerHTML = '';
        
        const conversations = {
            previous: {
                title: "💬 Previous Attempts Archive",
                subtitle: "Your greatest hits of being ignored",
                messages: [
                    { text: "Hey! How's your day going?", time: "2 days ago", read: true },
                    { text: "Did you see that funny meme I sent?", time: "2 days ago", read: true },
                    { text: "Just checking if you're okay...", time: "2 days ago", read: true },
                    { text: "I know you're busy but...", time: "2 days ago", read: true }
                ]
            },
            ignored: {
                title: "😢 Hall of Ignored Messages",
                subtitle: "These messages died for your sins",
                messages: [
                    { text: "Good morning! ☀️", time: "1 week ago", read: true },
                    { text: "Thinking of you ❤️", time: "1 week ago", read: true },
                    { text: "Miss talking to you", time: "1 week ago", read: true },
                    { text: "Are we okay?", time: "1 week ago", read: true }
                ]
            },
            silence: {
                title: "🙄 The Silent Treatment Collection",
                subtitle: "Your monologue continues",
                messages: [
                    { text: "I had the weirdest dream about you", time: "3 weeks ago", read: true },
                    { text: "This song reminded me of you", time: "3 weeks ago", read: true },
                    { text: "Can we talk?", time: "3 weeks ago", read: true },
                    { text: "I'm starting to feel crazy", time: "3 weeks ago", read: true }
                ]
            },
            hopeless: {
                title: "😭 The Desperation Chronicles",
                subtitle: "Rock bottom has a basement",
                messages: [
                    { text: "I know I'm being annoying but...", time: "1 month ago", read: true },
                    { text: "Please just say something", time: "1 month ago", read: true },
                    { text: "Even if it's to tell me to stop", time: "1 month ago", read: true },
                    { text: "I'll wait forever if I have to", time: "1 month ago", read: true }
                ]
            }
        };
        
        const conversation = conversations[type];
        
        // Add title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'intro-message';
        titleDiv.innerHTML = `
            <div class="intro-title">${conversation.title}</div>
            <p>${conversation.subtitle}</p>
            <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
                Returning to current chat in 10 seconds...
            </p>
        `;
        this.messagesContainer.appendChild(titleDiv);
        
        // Add past messages
        conversation.messages.forEach((msg, index) => {
            setTimeout(() => {
                this.addPastMessage(msg.text, msg.time, msg.read);
            }, index * 500);
        });
    }

    addPastMessage(text, time, isRead) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <img src="https://pbs.twimg.com/profile_images/1956422441569312770/OJe7wx2f_400x400.jpg" 
                 alt="Your Profile" 
                 class="message-avatar profile-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="message-avatar user-avatar fallback-avatar" style="display: none;">U</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-meta">
                    <span>${time}</span>
                    <span class="read-status">${isRead ? '✓✓ Read (but ignored)' : 'Sent'}</span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    loadCurrentConversation() {
        // Show the welcome screen instead of intro message
        this.messagesContainer.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-header">
                    <div class="welcome-title">Crush-GPT</div>
                    <div class="welcome-subtitle">Experience the authentic frustration of modern digital relationships</div>
                </div>
                
                <div class="welcome-examples">
                    <div class="example-section">
                        <div class="example-title">Examples</div>
                        <div class="example-item">
                            <div class="example-icon">💬</div>
                            <div class="example-text">"Hey! How's your day going?"</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">😊</div>
                            <div class="example-text">"Did you see that funny meme I sent?"</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">❤️</div>
                            <div class="example-text">"Thinking of you today"</div>
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <div class="example-title">Capabilities</div>
                        <div class="example-item">
                            <div class="example-icon">📱</div>
                            <div class="example-text">Reads your messages instantly</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">🚫</div>
                            <div class="example-text">Never replies (just like your crush)</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">😅</div>
                            <div class="example-text">Provides authentic ghosting experience</div>
                        </div>
                    </div>
                    
                    <div class="example-section">
                        <div class="example-title">Limitations</div>
                        <div class="example-item">
                            <div class="example-icon">💔</div>
                            <div class="example-text">Cannot provide emotional support</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">🤡</div>
                            <div class="example-text">Will make you question your self-worth</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">😭</div>
                            <div class="example-text">May cause excessive hope and disappointment</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }



    adjustTextareaHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Add user message
        this.addUserMessage(text);
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendButton.disabled = true;
        this.messagesSent++;
        
        // Simulate read receipt with delay
        setTimeout(() => {
            this.markLastMessageAsRead();
            this.messagesRead++;
            this.updateStats();
            
            // Randomly show typing indicator (40% chance)
            if (Math.random() < 0.4) {
                this.showTypingIndicator();
            }
            
            // Update hope level based on message count
            this.updateHopeLevel();
            
        }, this.getRandomDelay(500, 1200));
    }

    addUserMessage(text) {
        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit'
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <img src="https://pbs.twimg.com/profile_images/1956422441569312770/OJe7wx2f_400x400.jpg" 
                 alt="Your Profile" 
                 class="message-avatar profile-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="message-avatar user-avatar fallback-avatar" style="display: none;">U</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-meta">
                    <span>${timestamp}</span>
                    <span id="read-status-${this.messagesSent}" class="read-status">Sent</span>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    markLastMessageAsRead() {
        const readStatus = document.getElementById(`read-status-${this.messagesSent}`);
        if (readStatus) {
            // First show delivered
            readStatus.textContent = 'Delivered';
            
            setTimeout(() => {
                readStatus.textContent = '✓✓ Read';
                readStatus.classList.add('read-status');
            }, this.getRandomDelay(200, 500));
        }
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
        
        // Show typing for random duration (2-8 seconds for maximum trolling)
        const typingDuration = this.getRandomDelay(2000, 8000);
        
        setTimeout(() => {
            this.typingIndicator.classList.remove('show');
            
            // Occasionally show "stopped typing" hint
            if (Math.random() < 0.3) {
                this.showStoppedTypingHint();
            }
        }, typingDuration);
    }

    showStoppedTypingHint() {
        console.log('💔 Crush-GPT was typing but decided you\'re not worth the effort...');
        
        // Update status briefly to "Last seen typing..."
        const statusIndicator = document.querySelector('.status-indicator span');
        const originalText = statusIndicator.textContent;
        
        statusIndicator.textContent = 'Last seen typing...';
        
        setTimeout(() => {
            statusIndicator.textContent = originalText;
        }, 3000);
    }



    updateHopeLevel() {
        const hopeLevelElement = document.querySelector('.stat-row:nth-child(4) .stat-value');
        const selfRespectElement = document.querySelector('.stat-row:nth-child(5) .stat-value');
        
        const hopeLevels = [
            'Declining', 'Low', 'Critical', 'Non-existent', 
            'Delusional', 'Pathetic', 'Rock Bottom', 'Subterranean'
        ];
        
        const selfRespectLevels = [
            'Critical', 'Damaged', 'Destroyed', 'What respect?', 
            'Negative', 'Inexistent', 'Gone', 'Never had any'
        ];
        
        const level = Math.min(this.messagesSent - 1, hopeLevels.length - 1);
        
        if (hopeLevelElement) {
            hopeLevelElement.textContent = hopeLevels[level] || 'Declining';
        }
        
        if (selfRespectElement) {
            selfRespectElement.textContent = selfRespectLevels[level] || 'Critical';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    updateStats() {
        document.getElementById('messagesSent').textContent = this.messagesSent;
        document.getElementById('messagesRead').textContent = this.messagesRead;
        document.getElementById('repliesReceived').textContent = this.repliesReceived; // Always 0!
    }

    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addEncouragementSystem() {
        const encouragements = [
            "💡 Maybe they're just really busy crafting the perfect response...",
            "🤔 Third time's the charm, right? RIGHT?!",
            "📖 At least they're reading your messages! That's... something?",
            "🎭 Perhaps they're playing hard to get?",
            "🔋 Maybe their phone died... for the 15th time today...",
            "🌟 Keep believing in yourself! (But maybe lower your expectations)",
            "😅 Hey, at least you're consistent!",
            "💪 Persistence is key! (Or so they say...)",
            "🎯 You miss 100% of the shots you don't take! (You also miss the ones you do take)",
            "🧠 Einstein said insanity is doing the same thing expecting different results...",
            "💔 Your dedication to futile causes is truly admirable!",
            "🤡 Welcome to the circus! You're the main act!"
        ];

        let encouragementIndex = 0;
        let lastMessageCount = 0;

        // Show encouragement every 3 messages
        setInterval(() => {
            if (this.messagesSent > lastMessageCount && this.messagesSent % 3 === 0) {
                if (encouragementIndex < encouragements.length) {
                    console.log(encouragements[encouragementIndex]);
                    
                    // Also show as a temporary notification in the status
                    this.showTemporaryNotification(encouragements[encouragementIndex]);
                    
                    encouragementIndex++;
                }
                lastMessageCount = this.messagesSent;
            }
        }, 1000);
    }

    showTemporaryNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px 16px;
            max-width: 300px;
            font-size: 14px;
            color: var(--text-primary);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">💭 Reality Check</div>
            <div>${message.replace(/💡|🤔|📖|🎭|🔋|🌟|😅|💪|🎯|🧠|💔|🤡/, '')}</div>
        `;
        
        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Add some Easter eggs for persistent users
    addEasterEggs() {
        // Change page title after many messages
        if (this.messagesSent === 10) {
            document.title = "Crush-GPT - Still No Reply 😢";
        } else if (this.messagesSent === 20) {
            document.title = "Crush-GPT - Seriously? 🤡";
        } else if (this.messagesSent === 50) {
            document.title = "Crush-GPT - Get Some Help 💔";
        }
        

    }



    // Simulate random online/offline status changes
    simulateStatusChanges() {
        const statusText = document.querySelector('.status-indicator span');
        const statuses = [
            'Online (but ignoring you)',
            'Active 2 minutes ago',
            'Active 1 hour ago',
            'Online (probably ignoring everyone)',
            'Active now (reading but not replying)',
            'Last seen recently',
            'Online (definitely saw your message)'
        ];

        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every check
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                statusText.textContent = randomStatus;
                
                // Revert after 10 seconds
                setTimeout(() => {
                    statusText.textContent = 'Online (but ignoring you)';
                }, 10000);
            }
        }, 5000);
    }

    // Add motivational chat history items
    updateChatHistory() {
        const chatItems = document.querySelectorAll('.chat-item:not(.active)');
        const sadTitles = [
            '💬 Previous Attempts',
            '😢 More Ignored Messages', 
            '🙄 Still No Response',
            '😭 Day 47 of Silence',
            '🤡 Clown Behavior Archive',
            '💀 Messages That Died',
            '👻 Ghosted Conversations',
            '🗑️ Digital Trash Can'
        ];

        chatItems.forEach((item, index) => {
            if (index < sadTitles.length) {
                item.textContent = sadTitles[index];
            }
        });
    }

    // Enhanced message sending with easter eggs and auto-save
    onMessageSent() {
        this.addEasterEggs();
        
        // Auto-save chat every 5 messages
        if (this.messagesSent % 5 === 0) {
            this.saveCurrentChat();
            this.updateChatHistoryUI();
        }
        
        // First message triggers status simulation
        if (this.messagesSent === 1) {
            this.simulateStatusChanges();
        }
    }
}

// Enhanced message sending with easter eggs
CrushGPT.prototype.originalSendMessage = CrushGPT.prototype.sendMessage;
CrushGPT.prototype.sendMessage = function() {
    this.originalSendMessage();
    this.onMessageSent();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crushGPT = new CrushGPT();
    
    // Add some console art for fun
    console.log(`
    ╔══════════════════════════════════════╗
    ║          🖤 CRUSH-GPT 🤍             ║
    ║                                      ║
    ║     Where hopes go to die! 💔        ║
    ║                                      ║
    ║   Messages sent: ∞                   ║
    ║   Replies received: 0                ║
    ║   Self-respect: 404 Not Found        ║
    ║                                      ║
    ╚══════════════════════════════════════╝
    `);
    
    console.log('💡 Pro tip: Maybe try calling instead? (Just kidding, they won\'t answer that either)');
});

// Add some keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (window.crushGPT) {
            window.crushGPT.sendMessage();
        }
    }
    

});

// Add some final trolling when user tries to leave the page
window.addEventListener('beforeunload', (e) => {
    if (window.crushGPT && window.crushGPT.messagesSent > 5) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? What if they finally reply?! (They won't)";
        return "Are you sure you want to leave? What if they finally reply?! (They won't)";
    }
});