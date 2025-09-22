#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class AroelBotInstaller {
    constructor() {
        this.repoUrl = 'https://github.com/itsMeArul/AroelBot.git';
        this.botFolder = 'AroelBot';
        this.requiredNodeVersion = '16.0.0';
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };

        const timestamp = new Date().toLocaleTimeString();
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async question(query) {
        return new Promise(resolve => {
            rl.question(query, resolve);
        });
    }

    checkNodeVersion() {
        try {
            const version = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(version.replace('v', '').split('.')[0]);

            if (majorVersion < 16) {
                this.log(`Node.js version ${version} detected. Minimum required: ${this.requiredNodeVersion}`, 'error');
                return false;
            }

            this.log(`Node.js version ${version} detected - OK`, 'success');
            return true;
        } catch (error) {
            this.log('Node.js is not installed. Please install Node.js 16.0.0 or higher.', 'error');
            return false;
        }
    }

    checkGitInstalled() {
        try {
            execSync('git --version', { encoding: 'utf8' });
            this.log('Git is installed - OK', 'success');
            return true;
        } catch (error) {
            this.log('Git is not installed. Please install Git to continue.', 'error');
            return false;
        }
    }

    async cloneRepository() {
        try {
            if (fs.existsSync(this.botFolder)) {
                const overwrite = await this.question(`Folder '${this.botFolder}' already exists. Overwrite? (y/N): `);
                if (overwrite.toLowerCase() !== 'y') {
                    this.log('Installation cancelled.', 'warning');
                    return false;
                }

                this.log(`Removing existing folder: ${this.botFolder}`, 'info');
                fs.rmSync(this.botFolder, { recursive: true, force: true });
            }

            this.log(`Cloning repository from ${this.repoUrl}...`, 'info');
            execSync(`git clone ${this.repoUrl} ${this.botFolder}`, { stdio: 'inherit' });
            this.log('Repository cloned successfully!', 'success');
            return true;
        } catch (error) {
            this.log(`Failed to clone repository: ${error.message}`, 'error');
            return false;
        }
    }

    async installDependencies() {
        try {
            process.chdir(this.botFolder);
            this.log('Installing dependencies...', 'info');
            execSync('npm install', { stdio: 'inherit' });
            this.log('Dependencies installed successfully!', 'success');
            return true;
        } catch (error) {
            this.log(`Failed to install dependencies: ${error.message}`, 'error');
            return false;
        }
    }

    async createEnvFile() {
        try {
            const envTemplate = `# Discord Bot Configuration
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_server_guild_id_here
DISCORD_OWNER_ID=your_discord_user_id_here
DISCORD_CUSTOMER_ROLE_ID=customer_role_id_here

# API Configuration
API_KEY=your_api_key_here

# Bot Status (optional)
BOT_STATUS=online
BOT_ACTIVITY=Watching over users
`;

            this.log('Creating .env file template...', 'info');
            fs.writeFileSync('.env', envTemplate);
            this.log('.env file created successfully!', 'success');

            this.log('\nIMPORTANT: Please update the .env file with your actual configuration values:', 'warning');
            this.log('- Discord Bot Token from Discord Developer Portal');
            this.log('- Client ID and Guild ID from your server');
            this.log('- Your Discord User ID (for owner commands)');
            this.log('- API key for external service integration');

            return true;
        } catch (error) {
            this.log(`Failed to create .env file: ${error.message}`, 'error');
            return false;
        }
    }

    async registerCommands() {
        try {
            const registerCommands = await this.question('Do you want to register slash commands now? (y/N): ');

            if (registerCommands.toLowerCase() === 'y') {
                this.log('Registering slash commands...', 'info');
                this.log('Note: This requires proper .env configuration with valid Discord credentials', 'warning');

                try {
                    execSync('npm run register-commands', { stdio: 'inherit' });
                    this.log('Slash commands registered successfully!', 'success');
                } catch (error) {
                    this.log('Failed to register commands. Please check your .env configuration and run manually later.', 'warning');
                }
            }

            return true;
        } catch (error) {
            this.log(`Error during command registration: ${error.message}`, 'warning');
            return true;
        }
    }

    showNextSteps() {
        this.log('\n=== Installation Complete! ===', 'success');
        this.log('\nNext steps:', 'info');
        this.log('1. Edit the .env file with your configuration values');
        this.log('2. Make sure your Discord bot is invited to your server');
        this.log('3. Enable necessary intents in Discord Developer Portal');
        this.log('4. Run "npm start" or "npm run dev" to start the bot');
        this.log('5. If needed, run "npm run register-commands" to register slash commands');

        this.log('\nUseful commands:', 'info');
        this.log('  npm start              - Start the bot');
        this.log('  npm run dev            - Start the bot in development mode');
        this.log('  npm run register-commands - Register slash commands');

        this.log('\nFor support, please refer to the repository documentation.', 'info');
    }

    async install() {
        this.log('=== AroelBot Installation Script ===', 'info');
        this.log('This script will install AroelBot Discord bot on your system.', 'info');

        // Check prerequisites
        if (!this.checkNodeVersion() || !this.checkGitInstalled()) {
            rl.close();
            return false;
        }

        // Clone repository
        if (!await this.cloneRepository()) {
            rl.close();
            return false;
        }

        // Install dependencies
        if (!await this.installDependencies()) {
            rl.close();
            return false;
        }

        // Create .env file
        if (!await this.createEnvFile()) {
            rl.close();
            return false;
        }

        // Register commands
        await this.registerCommands();

        // Show next steps
        this.showNextSteps();

        rl.close();
        return true;
    }
}

// Run the installer
if (require.main === module) {
    const installer = new AroelBotInstaller();
    installer.install().catch(error => {
        console.error('Installation failed:', error);
        process.exit(1);
    });
}

module.exports = AroelBotInstaller;