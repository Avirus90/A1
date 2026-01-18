// Telegram Bot Interaction
const BOT_TOKEN = '8453962555:AAEJIrxPcXzF4rDlsrGDiBRngWylUrFYdtY';

class EdTechPlatform {
    constructor() {
        this.channelId = ''; // You'll set this after creating channel
        this.init();
    }
    
    async init() {
        // Check if Telegram Web App is available
        if (window.Telegram && Telegram.WebApp) {
            this.user = Telegram.WebApp.initDataUnsafe.user;
        }
        
        await this.loadContent();
    }
    
    async loadContent() {
        try {
            // Try GitHub first
            const response = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/api/content.json');
            this.content = await response.json();
            this.renderContent();
        } catch (error) {
            // Fallback to Telegram bot API
            await this.fetchFromTelegram();
        }
    }
    
    async fetchFromTelegram() {
        // Get channel info from bot
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@StorageBimbaContent`);
        const data = await response.json();
        
        if (data.ok) {
            this.channelId = data.result.id;
            await this.loadChannelContent();
        }
    }
    
    async loadChannelContent() {
        // Get last 50 messages from channel
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatHistory?chat_id=${this.channelId}&limit=50`);
        const data = await response.json();
        
        if (data.ok) {
            this.content = this.parseTelegramMessages(data.result);
            this.renderContent();
        }
    }
    
    parseTelegramMessages(messages) {
        return messages.filter(msg => msg.video || msg.document).map(msg => ({
            id: msg.message_id,
            title: msg.caption || 'Educational Content',
            type: msg.video ? 'video' : 'pdf',
            telegram_id: msg.message_id,
            date: new Date(msg.date * 1000).toLocaleDateString()
        }));
    }
    
    renderContent() {
        const container = document.getElementById('course-grid');
        if (!container) return;
        
        container.innerHTML = this.content.map(item => `
            <div class="course-card">
                <h3>${item.title}</h3>
                <p>Type: ${item.type.toUpperCase()}</p>
                <button onclick="platform.playContent(${item.id}, '${item.type}')" class="btn">
                    ${item.type === 'video' ? '▶️ Play' : '📄 View'}
                </button>
            </div>
        `).join('');
    }
    
    playContent(messageId, type) {
        const player = document.getElementById('video-player');
        
        if (type === 'video') {
            player.innerHTML = `
                <iframe 
                    src="https://t.me/c/${this.channelId}/${messageId}?embed=1"
                    width="100%"
                    height="100%"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            `;
        } else if (type === 'pdf') {
            // For PDFs, use Google Docs viewer with Telegram file
            player.innerHTML = `
                <iframe 
                    src="https://docs.google.com/viewer?url=https://api.telegram.org/file/bot${BOT_TOKEN}/FILE_PATH&embedded=true"
                    width="100%"
                    height="100%"
                    frameborder="0">
                </iframe>
            `;
        }
    }
}

// Initialize platform
const platform = new EdTechPlatform();
