🐋 WLDAlert - Real-Time Blockchain Transaction Alerting Service

## Description

The WorldCoin Whale Alert Bot is a Node.js application designed to provide real-time alerts about significant transactions involving WorldCoin cryptocurrency. This bot keeps users informed about large transactions on platforms like Twitter, Telegram, and Discord.

## Features

- Instant notifications for major WorldCoin transactions.
- Customizable alert thresholds for different transaction amounts.
- Supports Twitter, Telegram, and Discord platforms for notifications.
- Easy setup and configuration.

## Prerequisites

- Node.js 
- Twitter Developer Account and API Key for Twitter notifications.
- Telegram Bot Token for Telegram notifications.
- Discord Bot Token for Discord notifications.

## Installation

1. Clone this repository: `git clone https://github.com/yourusername/worldAlert.git`
2. Navigate to the project directory: `cd worldAlert`
3. Install dependencies: `npm install`
4. Configure API keys and tokens in the `config.js` file.
5. Set up alert thresholds and notification channels in the `config.js` file.
6. Run the application: `node index.js`

## Configuration

1. Create `.env` file.
2. Open the `.env` file.
3. Configure Twitter API settings: Consumer Key, Consumer Secret, Access Token, and Access Token Secret.
4. Set up Telegram Bot Token.
5. Set up Discord Bot Token.
6. Adjust alert thresholds and other settings as needed.

## Usage

Run the bot using the following command:

```bash
node index.js
```

The bot will start monitoring large WorldCoin transactions and send notifications to your configured platforms when the defined alert thresholds are met.







