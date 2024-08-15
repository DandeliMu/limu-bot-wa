const { Client, LocalAuth} = require('whatsapp-web.js');

const client = new Client({
    // authStrategy: new LocalAuth({
    //     dataPath: 'limuAI'
    // }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://github.com/wppconnect-team/wa-version/raw/main/html/2.3000.1013991265-alpha.html',
    }
});

module.exports = client;