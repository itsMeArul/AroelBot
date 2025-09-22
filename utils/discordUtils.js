require('dotenv').config();

class DiscordUtils {
    constructor(client) {
        this.client = client;
    }

    async getPremiumUsersCount() {
        try {
            const guildId = process.env.DISCORD_GUILD_ID;
            const roleId = process.env.DISCORD_CUSTOMER_ROLE_ID;

            if (!guildId || !roleId) {
                console.error('Missing DISCORD_GUILD_ID or DISCORD_CUSTOMER_ROLE_ID in environment variables');
                return 0;
            }

            const guild = await this.client.guilds.fetch(guildId);
            const role = await guild.roles.fetch(roleId);

            if (!role) {
                console.error(`Role ${roleId} not found in guild`);
                return 0;
            }

            await guild.members.fetch({ force: true });
            return role.members.size;
        } catch (error) {
            console.error('Error fetching premium users count:', error);
            return 0;
        }
    }

    async getTotalGuildMembers() {
        try {
            const guildId = process.env.DISCORD_GUILD_ID;

            if (!guildId) {
                console.error('Missing DISCORD_GUILD_ID in environment variables');
                return 0;
            }

            const guild = await this.client.guilds.fetch(guildId);
            return guild.memberCount;
        } catch (error) {
            console.error('Error fetching total guild members:', error);
            return 0;
        }
    }
}

module.exports = DiscordUtils;