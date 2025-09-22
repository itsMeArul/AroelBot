require('dotenv').config();
const { ActivityType } = require('discord.js');
const apiClient = require('./apiClient');
const DiscordUtils = require('./discordUtils');

class RichPresenceManager {
    constructor(client) {
        this.client = client;
        this.apiClient = apiClient;
        this.discordUtils = new DiscordUtils(client);
        this.currentStatusIndex = 0;
        this.statusInterval = null;

        this.statuses = [
            {
                type: ActivityType.Watching,
                getMessage: async () => {
                    const executionCount = await this.apiClient.fetchExecutionCount();
                    return `${executionCount} total executions`;
                },
                fallback: 'total executions'
            },
            {
                type: ActivityType.Watching,
                getMessage: async () => {
                    const premiumCount = await this.discordUtils.getPremiumUsersCount();
                    const totalMembers = await this.discordUtils.getTotalGuildMembers();
                    return `${premiumCount} Premium users | ${totalMembers.toLocaleString()} Total members`;
                },
                fallback: 'premium users | total members'
            },
            {
                type: ActivityType.Playing,
                getMessage: async () => 'best script CDID',
                fallback: 'best script CDOD'
            },
            {
                type: ActivityType.Playing,
                getMessage: async () => 'light, stable, and customizable script',
                fallback: 'light, stable, and customizable script'
            }
        ];
    }

    async updateStatus() {
        try {
            const status = this.statuses[this.currentStatusIndex];
            let message;

            try {
                message = await status.getMessage();
            } catch (apiError) {
                console.error('API Error in rich presence:', apiError);
                message = status.fallback || 'Loading...';
            }

            const activity = {
                name: message,
                type: status.type
            };

            await this.client.user.setActivity(activity);

            this.currentStatusIndex = (this.currentStatusIndex + 1) % this.statuses.length;

            const activityName = status.type === ActivityType.Watching ? 'Watching' : 'Playing';
            console.log(`Updated rich presence: ${activityName} ${message}`);
        } catch (error) {
            console.error('Error updating rich presence:', error);
        }
    }

    start() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        this.updateStatus();

        this.statusInterval = setInterval(() => {
            this.updateStatus();
        }, 15000);
    }

    stop() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
    }
}

module.exports = RichPresenceManager;