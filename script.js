class CrushGPT {
    constructor() {
        // Statistics
        this.messagesSent = 0;
        this.messagesRead = 0;
        this.repliesReceived = 0;
        
        // Chat history storage (using memory instead of localStorage)
        this.chatHistory = [];
        this.currentChatId = Date.now();
        
        // DOM Elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.statusText = document.getElementById('statusText');
        
        // Initialize
        this.initializeEventListeners();
        this.updateStats();
        this.addEncouragementSystem();
        this.simulateStatusChanges();
        this.initializePastConversations();
        this.initializeExampleClicks();
    }

    initializeExampleClicks() {
        // Add click handlers to example items
        document.addEventListener('click', (e) => {
            const exampleItem = e.target.closest('.example-item');
            if (exampleItem) {
                const exampleText = exampleItem.querySelector('.example-text');
                if (exampleText) {
                    const text = exampleText.textContent.replace(/[""]/g, ''); // Remove quotes
                    
                    // Add visual feedback
                    exampleItem.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        exampleItem.style.transform = '';
                    }, 150);
                    
                    // Auto-send the message
                    this.messageInput.value = text;
                    this.sendMessage();
                }
            }
        });
    }

    initializeEventListeners() {
        // Sidebar toggles
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.mobileSidebarToggle.addEventListener('click', () => this.toggleSidebar());

        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input handling
        this.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.sendBtn.disabled = this.messageInput.value.trim() === '';
        });

        // New chat button
        this.newChatBtn.addEventListener('click', () => {
            this.startNewChat();
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                !this.mobileSidebarToggle.contains(e.target) &&
                !this.sidebar.classList.contains('collapsed')) {
                this.toggleSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('collapsed');
            }
        });
    }

    initializePastConversations() {
        const pastChats = document.querySelectorAll('.chat-item[data-conversation]');
        
        pastChats.forEach(chatItem => {
            chatItem.addEventListener('click', () => {
                const conversationType = chatItem.getAttribute('data-conversation');
                this.loadPastConversation(conversationType);
                
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
                    { text: "Just checking if you're okay... 😀", time: "2 days ago", read: true },
                    { text: "I know you're busy but...", time: "2 days ago", read: true }
                ]
            },
            ignored: {
                title: "😭 Hall of Ignored Messages",
                subtitle: "These messages died for your entertainment",
                messages: [
                    { text: "Good morning! 🥰", time: "1 week ago", read: true },
                    { text: "Thinking of you 💔", time: "1 week ago", read: true },
                    { text: "Miss talking to you", time: "1 week ago", read: true },
                    { text: "Are we okay? 😃", time: "1 week ago", read: true }
                ]
            },
            silence: {
                title: "🤡 The Silent Treatment Collection",
                subtitle: "Your monologue continues",
                messages: [
                    { text: "I had the weirdest dream about you", time: "3 weeks ago", read: true },
                    { text: "This song reminded me of you 🥀", time: "3 weeks ago", read: true },
                    { text: "Can we talk?", time: "3 weeks ago", read: true },
                    { text: "I'm starting to feel crazy 💅🏻", time: "3 weeks ago", read: true }
                ]
            },
            hopeless: {
                title: "💅🏻 The Desperation Chronicles",
                subtitle: "Rock bottom has a basement",
                messages: [
                    { text: "I know I'm being annoying but...", time: "1 month ago", read: true },
                    { text: "Please just say something 😭", time: "1 month ago", read: true },
                    { text: "Even if it's to tell me to stop", time: "1 month ago", read: true },
                    { text: "I'll wait forever if I have to 👍🏻", time: "1 month ago", read: true }
                ]
            }
        };
        
        const conversation = conversations[type];
        
        // Add title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'intro-message';
        titleDiv.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">${conversation.title}</div>
                <p style="margin-bottom: 20px;">${conversation.subtitle}</p>
                <p style="font-size: 12px; opacity: 0.7;">
                    Returning to current chat in 15 seconds...
                </p>
            </div>
        `;
        this.messagesContainer.appendChild(titleDiv);
        
        // Add past messages with animation
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
                 class="message-avatar avatar-img profile-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">
            <div class="message-avatar fallback-avatar" style="display: none; width: 32px; height: 32px; border-radius: 50%; background: var(--accent-color); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 14px;">U</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-meta">
                    <span>${time}</span>
                    <span class="read-status">${isRead ? '✓✓ Read (but ignored) 🤡' : 'Sent'}</span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    loadCurrentConversation() {
        // Show the welcome screen
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
                            <div class="example-icon">😀</div>
                            <div class="example-text">"Did you see that funny meme I sent?"</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">🥰</div>
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
                            <div class="example-icon">👍🏻</div>
                            <div class="example-text">Never replies (just like your crush)</div>
                        </div>
                        <div class="example-item">
                            <div class="example-icon">😃</div>
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

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }

    adjustTextareaHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Clear welcome screen if first message
        if (this.messagesSent === 0) {
            this.messagesContainer.innerHTML = '';
        }

        // Add user message
        this.addUserMessage(text);
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendBtn.disabled = true;
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

        // Auto-save chat every 5 messages
        if (this.messagesSent % 5 === 0) {
            this.saveCurrentChat();
        }

        this.addEasterEggs();
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
                 class="message-avatar avatar-img profile-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color); margin-top: 4px;">
            <div class="message-avatar fallback-avatar" style="display: none; width: 32px; height: 32px; border-radius: 50%; background: var(--accent-color); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 14px;">U</div>
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
        
        // Show typing for random duration (2-8 seconds for maximum effect)
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
        const originalText = this.statusText.textContent;
        
        this.statusText.textContent = 'Last seen typing... 🤡';
        
        setTimeout(() => {
            this.statusText.textContent = originalText;
        }, 3000);
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
        this.updateSelfRespect();
    }

    updateHopeLevel() {
        const hopeLevelElement = document.getElementById('hopeLevel');
        const hopeLevels = [
            'High 🥰', 'Medium 😀', 'Low 😃', 'Very Low 👍🏻', 
            'Critical 💔', 'Gone 💅🏻', 'What hope? 🤡', 'Delusional 😭'
        ];
        
        const level = Math.min(Math.floor(this.messagesSent / 3), hopeLevels.length - 1);
        
        if (hopeLevelElement) {
            hopeLevelElement.textContent = hopeLevels[level] || 'High 🥰';
        }
    }

    updateSelfRespect() {
        const selfRespectElement = document.getElementById('selfRespect');
        const selfRespectLevels = [
            'Critical 💅🏻', 'Damaged 🤡', 'Destroyed 😭', 'What respect? 💔', 
            'Negative 🥀', 'Gone 👍🏻', 'Never had any 😀', 'Rock bottom 😃'
        ];
        
        const level = Math.min(Math.floor(this.messagesSent / 2), selfRespectLevels.length - 1);
        
        if (selfRespectElement) {
            selfRespectElement.textContent = selfRespectLevels[level] || 'Critical 💅🏻';
        }
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
        }
    }

    updateChatHistoryUI() {
        // Update with actual chat history if needed
        console.log('Chat history updated:', this.chatHistory);
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
        this.updateHopeLevel();
        this.updateSelfRespect();
    }

    getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Simulate random online/offline status changes
    simulateStatusChanges() {
        const statuses = [
            'online (but ignoring you) 😀',
            'active 2 minutes ago 😃',
            'active 1 hour ago 👍🏻',
            'online (probably ignoring everyone) 🤡',
            'active now (reading but not replying) 💅🏻',
            'last seen recently 🥰',
            'online (definitely saw your message) 😭'
        ];

        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every check
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                this.statusText.textContent = randomStatus;
                
                // Revert after 10 seconds
                setTimeout(() => {
                    this.statusText.textContent = 'online (but ignoring you) 😀';
                }, 10000);
            }
        }, 5000);
    }

    addEncouragementSystem() {
        const encouragements = [
            "💭 Maybe they're just really busy crafting the perfect response... 🥰",
            "🤔 Third time's the charm, right? RIGHT?! 😀",
            "📖 At least they're reading your messages! That's... something? 😃",
            "🎭 Perhaps they're playing hard to get? 👍🏻",
            "🔋 Maybe their phone died... for the 15th time today... 💔",
            "🌟 Keep believing in yourself! (But maybe lower your expectations) 💅🏻",
            "😅 Hey, at least you're consistent! 🤡",
            "💪 Persistence is key! (Or so they say...) 😭",
            "🎯 You miss 100% of the shots you don't take! (You also miss the ones you do take) 🥀"
        ];

        let encouragementIndex = 0;
        let lastMessageCount = 0;

        // Show encouragement every 3 messages
        setInterval(() => {
            if (this.messagesSent > lastMessageCount && this.messagesSent % 3 === 0) {
                if (encouragementIndex < encouragements.length) {
                    console.log(encouragements[encouragementIndex]);
                    
                    // Also show as a temporary notification
                    this.showTemporaryNotification(encouragements[encouragementIndex]);
                    
                    encouragementIndex++;
                }
                lastMessageCount = this.messagesSent;
            }
        }, 1000);
    }

    showTemporaryNotification(message) {
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
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px; color: var(--accent-color);">💭 Reality Check</div>
            <div>${message}</div>
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
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 4000);
    }

    // Add Easter eggs for persistent users
    addEasterEggs() {
        // Change page title after many messages
        if (this.messagesSent === 10) {
            document.title = "Crush-GPT - Still No Reply 😭";
        } else if (this.messagesSent === 20) {
            document.title = "Crush-GPT - Seriously? 🤡";
        } else if (this.messagesSent === 50) {
            document.title = "Crush-GPT - Get Some Help 💅🏻";
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crushGPT = new CrushGPT();
    
    // Add some console art for fun
    console.log(`
    ╔══════════════════════════════════════╗
    ║          🖤 CRUSH-GPT 💔             ║
    ║                                      ║
    ║     Where hopes go to die! 🥀        ║
    ║                                      ║
    ║   Messages sent: ∞                   ║
    ║   Replies received: 0                ║
    ║   Self-respect: 404 Not Found 🤡     ║
    ║                                      ║
    ╚══════════════════════════════════════╝
    `);
    
    console.log('💡 Pro tip: Maybe try calling instead? (Just kidding, they won\'t answer that either) 😀');
});

// Add keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (window.crushGPT) {
            window.crushGPT.sendMessage();
        }
    }
    
    // Ctrl/Cmd + N for new chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (window.crushGPT) {
            window.crushGPT.startNewChat();
        }
    }
    
    // Escape to close sidebar on mobile
    if (e.key === 'Escape' && window.innerWidth <= 768) {
        if (window.crushGPT && !window.crushGPT.sidebar.classList.contains('collapsed')) {
            window.crushGPT.toggleSidebar();
        }
    }
});

// Add some final trolling when user tries to leave the page
window.addEventListener('beforeunload', (e) => {
    if (window.crushGPT && window.crushGPT.messagesSent > 5) {
        e.preventDefault();
        const messages = [
            "Are you sure you want to leave? What if they finally reply?! 🥰",
            "Wait! They might be typing right now... 😀",
            "Don't give up! Maybe the 51st message will work! 👍🏻",
            "One more refresh couldn't hurt... 🤡"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        e.returnValue = randomMessage;
        return randomMessage;
    }
});