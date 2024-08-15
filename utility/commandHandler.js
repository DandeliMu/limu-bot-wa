// utility/commandHandler.js
const fs = require('fs');
const path = require('path');

const commands = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'));
for (const file of commandFiles) {
    const commandName = path.basename(file, '.js');
    const commandFunction = require(`../commands/${file}`);
    commands.set(commandName, commandFunction);
}

module.exports = commands;
