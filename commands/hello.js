async function helloCommand(sender, message) {
    await message.reply('Hello!');
}

module.exports = helloCommand;