require('dotenv').config();

// const keep_alive = require('./keep_alive.js');

const qrcode = require('qrcode-terminal');
const { initialize, sendMessage } = require('./ai');
const client = require('./utility/client');
// Load command handler
const commands = require('./utility/commandHandler');

client.on('authenticated', (session) => {
    console.log('Authenticated:', session);
});

client.on('qr', (qr) => {
    // qrcode.generate(qr, { small: true });
    console.log(qr);
    var http = require('http');

http.createServer(function (req, res) {
  res.write(qr);
  res.end();
}).listen(8080);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
    if (message.fromMe) return;

    const botNumber = `@${client.info.wid.user}`;
    const chat = await message.getChat();
    const isGroup = chat.isGroup;
    let messageBody = message.body;

    const shouldRespond = (await message.getMentions()).some(contact => contact.isMe) || (message.hasQuotedMsg && (await message.getQuotedMessage()).id.participant.user == client.info.wid.user);

    if (shouldRespond) {
        try {
            await initialize();
            chat.sendStateTyping();
            messageBody = messageBody.replace(/@\d+/g, '').trim();
            const sender = isGroup ? message.author : message.from;
            // const response = await sendMessage(sender, messageBody);

            // await message.reply(response);
            await message.reply(messageBody);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
});

client.initialize();
