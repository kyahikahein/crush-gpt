class CrushGPT {
    constructor() {
        this.crushName = 'Sana';
        this.messagesSent = 0;
        this.messagesRead = 0;
        this.repliesReceived = 0;
        this.chatHistory = [];
        this.currentChatId = Date.now();
        
        this.initializeElements();
        this.showNameModal();
        this.initializeEventListeners();
        this.updateStats();
        this.addEncouragementSystem();
        this.simulateStatusChanges();
    }

    initializeElements() {
        this.nameModal = document.getElementById('nameModal');
        this.crushNameInput = document.getElementById('crushNameInput');
        this.confirmNameBtn = document.getElementById('confirmNameBtn');
        this.skipNameBtn = document.getElementById('skipNameBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.statusText = document.getElementById('statusText');
        this.crushDisplayName = document.getElementById('crushDisplayName');
        this.crushAvatar = document.getElementById('crushAvatar');
        this.typingAvatar = document.getElementById('typingAvatar');
        this.typingName = document.getElementById('typingName');
        this.statsPanel = document.getElementById('statsPanel');
    }

    showNameModal() {
        this.nameModal.classList.remove('hidden');
        this.crushNameInput.focus();
    }

    hideNameModal() {
        this.nameModal.classList.add('hidden');
    }

    updateCrushName(name) {
        this.crushName = name || 'Sana';
        const firstLetter = this.crushName.charAt(0).toUpperCase();
        
        // Update all UI elements
        this.crushDisplayName.textContent = this.crushName;
        this.crushAvatar.textContent = firstLetter;
        this.typingAvatar.textContent = firstLetter;
        this.typingName.textContent = this.crushName;
        this.messageInput.placeholder = `Message ${this.crushName}...`;
        
        // Update status messages to include name
        this.statusText.textContent = `online (but ignoring you) 😔`;
    }

    initializeEventListeners() {
        // Name modal events
        this.confirmNameBtn.addEventListener('click', () => {
            const name = this.crushNameInput.value.trim();
            this.updateCrushName(name);
            this.hideNameModal();
        });

        this.skipNameBtn.addEventListener('click', () => {
            this.updateCrushName('Sana');
            this.hideNameModal();
        });

        this.crushNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.confirmNameBtn.click();
            }
        });

        // Sidebar toggles
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.mobileSidebarToggle.addEventListener('click', () => this.toggleMobileSidebar());

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
                this.sidebar.classList.contains('mobile-open')) {
                this.toggleMobileSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebar.classList.remove('mobile-open');
            }
            this.adjustStatsPanel();
        });

        // Initialize past conversations
        this.initializePastConversations();

        // Initialize stats panel positioning
        this.adjustStatsPanel();
    }

    toggleSidebar() {
        if (window.innerWidth > 768) {
            this.sidebar.classList.toggle('collapsed');
            this.adjustStatsPanel();
        }
    }

    toggleMobileSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.toggle('mobile-open');
        }
    }

    adjustStatsPanel() {
        const sidebarWidth = this.sidebar.classList.contains('collapsed') ? 70 : 280;
        if (window.innerWidth > 768) {
            this.statsPanel.style.right = `${20}px`;
        }
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
        this.messagesContainer.innerHTML = '';
        
        const conversations = {
            previous: {
                title: `💬 Previous Attempts with ${this.crushName}`,
                subtitle: "Your greatest hits of being ignored",
                messages: [
                    { text: `Hey ${this.crushName}! How's your day going?`, time: "2 days ago", read: true },
                    { text: "Did you see that funny meme I sent?", time: "2 days ago", read: true },
                    { text: "Just checking if you're okay... 😔", time: "2 days ago", read: true },
                    { text: "I know you're busy but...", time: "2 days ago", read: true }
                ]
            },
            ignored: {
                title: `😭 Hall of Ignored Messages to ${this.crushName}`,
                subtitle: "These messages died for your entertainment",
                messages: [
                    { text: "Good morning! 🥰", time: "1 week ago", read: true },
                    { text: `Thinking of you ${this.crushName} 💕`, time: "1 week ago", read: true },
                    { text: "Miss talking to you", time: "1 week ago", read: true },
                    { text: "Are we okay? 😟", time: "1 week ago", read: true }
                ]
            }
        };
        
        const conversation = conversations[type];
        
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
                 class="message-avatar avatar-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">
            <div class="message-avatar fallback-avatar" style="display: none;">U</div>
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
        this.messagesContainer.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-header">
                    <div class="welcome-title">Crush-GPT</div>
                    <div class="welcome-subtitle">Experience the authentic frustration of texting ${this.crushName}</div>
                </div>
            </div>
        `;
    }

    adjustTextareaHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        if (this.messagesSent === 0) {
            this.messagesContainer.innerHTML = '';
        }

        this.addUserMessage(text);
        
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendBtn.disabled = true;
        this.messagesSent++;
        
        setTimeout(() => {
            this.markLastMessageAsRead();
            this.messagesRead++;
            this.updateStats();
            
            if (Math.random() < 0.4) {
                this.showTypingIndicator();
            }
            
            this.updateHopeLevel();
            
        }, this.getRandomDelay(500, 1200));

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
                 class="message-avatar avatar-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="message-avatar fallback-avatar" style="display: none;">U</div>
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
        
        const typingDuration = this.getRandomDelay(2000, 8000);
        
        setTimeout(() => {
            this.typingIndicator.classList.remove('show');
            
            if (Math.random() < 0.3) {
                this.showStoppedTypingHint();
            }
        }, typingDuration);
    }

    showStoppedTypingHint() {
        const originalText = this.statusText.textContent;
        
        this.statusText.textContent = `Last seen typing... 🤡`;
        
        setTimeout(() => {
            this.statusText.textContent = originalText;
        }, 3000);
    }

    startNewChat() {
        this.saveCurrentChat();
        
        this.messagesSent = 0;
        this.messagesRead = 0;
        this.repliesReceived = 0;
        this.currentChatId = Date.now();
        
        this.loadCurrentConversation();
        this.updateStats();
        this.updateHopeLevel();
        this.updateSelfRespect();
    }

    updateHopeLevel() {
        const hopeLevelElement = document.getElementById('hopeLevel');
        const hopeLevels = [
            'High 🥰', 'Medium 😔', 'Low 😟', 'Very Low 💔', 
            'Critical 💕', 'Gone 💅🏻', 'What hope? 🤡', 'Delusional 😭'
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
            'Negative 🥀', 'Gone 💔', 'Never had any 😔', 'Rock bottom 😟'
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
                crushName: this.crushName,
                stats: {
                    sent: this.messagesSent,
                    read: this.messagesRead,
                    replies: this.repliesReceived
                }
            };

            this.chatHistory = this.chatHistory.filter(chat => chat.id !== this.currentChatId);
            this.chatHistory.unshift(chatData);
            
            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(0, 10);
            }
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
        document.getElementById('repliesReceived').textContent = this.repliesReceived;
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

    simulateStatusChanges() {
        const getStatusMessages = () => [
            `online (but ignoring you) 😔`,
            `active 2 minutes ago 😟`,
            `active 1 hour ago 💔`,
            `online (probably ignoring everyone) 🤡`,
            `active now (reading but not replying) 💅🏻`,
            `last seen recently 🥰`,
            `online (definitely saw your message) 😭`
        ];

        setInterval(() => {
            if (Math.random() < 0.1) {
                const statuses = getStatusMessages();
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                this.statusText.textContent = randomStatus;
                
                setTimeout(() => {
                    this.statusText.textContent = `online (but ignoring you) 😔`;
                }, 10000);
            }
        }, 5000);
    }

    addEncouragementSystem() {
        const getEncouragements = () => [
            `💭 Maybe ${this.crushName} is just really busy crafting the perfect response... 🥰`,
            `🤔 Third time's the charm with ${this.crushName}, right? RIGHT?! 😔`,
            `📖 At least ${this.crushName} is reading your messages! That's... something? 😟`,
            `🎭 Perhaps ${this.crushName} is playing hard to get? 💔`,
            `🔋 Maybe ${this.crushName}'s phone died... for the 15th time today... 💕`,
            `🌟 Keep believing in yourself! (But maybe lower your expectations with ${this.crushName}) 💅🏻`,
            `😅 Hey, at least you're consistent with ${this.crushName}! 🤡`,
            `💪 Persistence is key with ${this.crushName}! (Or so they say...) 😭`,
            `🎯 You miss 100% of the shots you don't take! (You also miss the ones you do take with ${this.crushName}) 🥀`
        ];

        let encouragementIndex = 0;
        let lastMessageCount = 0;

        setInterval(() => {
            if (this.messagesSent > lastMessageCount && this.messagesSent % 3 === 0) {
                const encouragements = getEncouragements();
                if (encouragementIndex < encouragements.length) {
                    console.log(encouragements[encouragementIndex]);
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
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
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
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 4000);
    }

    addEasterEggs() {
        if (this.messagesSent === 10) {
            document.title = `Crush-GPT - Still No Reply from ${this.crushName} 😭`;
        } else if (this.messagesSent === 20) {
            document.title = `Crush-GPT - Seriously ${this.crushName}? 🤡`;
        } else if (this.messagesSent === 50) {
            document.title = `Crush-GPT - Get Some Help 💅🏻`;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crushGPT = new CrushGPT();
    
    console.log(`
╔══════════════════════════════════════════╗
║          💖 CRUSH-GPT 💔             ║
║                                      ║
║     Where hopes go to die! 🥀        ║
║                                      ║
║   Messages sent: ∞                   ║
║   Replies received: 0                ║
║   Self-respect: 404 Not Found 🤡     ║
║                                      ║
╚══════════════════════════════════════════╝
    `);
    
    console.log('💡 Pro tip: Maybe try calling instead? (Just kidding, they won\'t answer that either) 😔');
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (window.crushGPT) {
            window.crushGPT.sendMessage();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (window.crushGPT) {
            window.crushGPT.startNewChat();
        }
    }
    
    if (e.key === 'Escape' && window.innerWidth <= 768) {
        if (window.crushGPT && window.crushGPT.sidebar.classList.contains('mobile-open')) {
            window.crushGPT.toggleMobileSidebar();
        }
    }
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    if (window.crushGPT && window.crushGPT.messagesSent > 5) {
        e.preventDefault();
        const messages = [
            `Are you sure you want to leave? What if ${window.crushGPT.crushName} finally replies?! 🥰`,
            `Wait! ${window.crushGPT.crushName} might be typing right now... 😔`,
            "Don't give up! Maybe the 51st message will work! 💔",
            "One more refresh couldn't hurt... 🤡"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        e.returnValue = randomMessage;
        return randomMessage;
    }
});