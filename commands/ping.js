const client = require("../utility/client");

async function ping(sender, message) {
    const startTimestamp = Date.now();
    let msgId;
    // Perform a simple operation (e.g., sending a message)
    await client.sendMessage(sender, 'Checking latency...').then(msg => {
        msgId = msg.id;
    });
    ;
    const endTimestamp = Date.now();

    // Calculate latency in milliseconds
    const latency = endTimestamp - startTimestamp;
    console.log(`Latency: ${latency} ms`);
    // const msg = client.getMessageById(sender._serialized, msgId);
    // msg.edit('tes');
    await client.sendMessage(sender, `${latency}`);
}
module.exports = ping;