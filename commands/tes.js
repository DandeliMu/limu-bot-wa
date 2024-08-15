// const { sendMessage, initialize } = require("../ai");

async function ai(sender, message) {
    // await initialize();
    // await message.reply()
    console.log(sender);
    console.log(message.body);
    
}

module.exports = ai;