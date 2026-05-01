const mineflayer = require('mineflayer');

export default async function handler(req, res) {
    const { host, port } = req.query;

    // 1. Set headers to allow "Streaming" logs to the browser
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const sendLog = (msg) => res.write(`[${new Date().toLocaleTimeString()}] ${msg}\n`);

    sendLog(`Starting bot for ${host}:${port}...`);

    // 2. Create the bot instance
    const bot = mineflayer.createBot({
        host: host,
        port: parseInt(port) || 25565,
        username: `KS_Bot_${Math.floor(Math.random() * 999)}`,
        version: false // Auto-negotiate protocol version
    });

    return new Promise((resolve) => {
        bot.on('login', () => {
            sendLog("SUCCESS: Bot authenticated and logging in.");
        });

        bot.on('spawn', () => {
            sendLog("SPAWN: Bot has joined the world.");
            bot.chat("KS Bot is online. Note: I will auto-disconnect in 55s.");
        });

        bot.on('message', (jsonMsg) => {
            sendLog(`CHAT: ${jsonMsg.toString()}`);
        });

        bot.on('kicked', (reason) => {
            sendLog(`KICKED: ${reason}`);
            resolve();
        });

        bot.on('error', (err) => {
            sendLog(`ERROR: ${err.message}`);
            resolve();
        });

        // 3. Vercel Shutdown Prevention
        // We close the bot at 55 seconds so the function ends cleanly 
        // before Vercel's 60-second "execution timeout" kills it.
        setTimeout(() => {
            sendLog("SYSTEM: Reaching Vercel 60s limit. Closing connection...");
            bot.quit();
            resolve();
        }, 55000);
    });
}
