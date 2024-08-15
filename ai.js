const fs = require('fs');
const OpenAI = require("openai");
const addToGist = require("./utility/githubGists");
const fetch = require('node-fetch');
const { LIMUAI_KEY, ASSISTANT_ID, GISTS_API } = process.env;

const openai = new OpenAI({
    apiKey: `${LIMUAI_KEY}`
});

const assistantId = ASSISTANT_ID;
const gistId = "84c2d1dedd051714de649a7157be0680";
let pollingIntervals = {};
let userThreads = {};

async function loadUserThreads() {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${GISTS_API}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching Gist: ${response.statusText}`);
        }

        const data = await response.json();
        const fileContent = data.files['userThreads.json'].content;

        if (fileContent.trim()) {
            return JSON.parse(fileContent);
        }
    } catch (err) {
        console.error('Error reading userThreads from Gist:', err);
    }
    return {};
}

async function saveUserThreads() {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GISTS_API}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'userThreads.json': {
                        content: JSON.stringify(userThreads, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error saving Gist: ${response.statusText}`);
        }
    } catch (err) {
        console.error('Error saving userThreads to Gist:', err);
    }
}

async function createMessage(threadId, message) {
    const threadMessages = await openai.beta.threads.messages.create(
        threadId,
        { role: "user", content: message }
    );

    return threadMessages;
}

async function createThread(userId) {
    const thread = await openai.beta.threads.create();
    userThreads[userId] = thread.id;
    await saveUserThreads();
    return thread.id;
}

async function runAssistant(assistant_id, threadId) {
    const response = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistant_id }
    );

    return response;
}

async function checkingStatus(threadId, runId) {
    const runObject = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
    );

    const status = runObject.status;

    if (status === 'completed') {
        clearInterval(pollingIntervals[threadId]);
        delete pollingIntervals[threadId];

        const messagesList = await openai.beta.threads.messages.list(threadId);
        let messages = [];

        messagesList.body.data.forEach(message => {
            messages.push(message.content[0].text);
        });

        return messages[0].value;
    }
}

async function sendMessage(userId, prompt) {
    let threadId = userThreads[userId];

    if (!threadId) {
        threadId = await createThread(userId);
    }

    const result = await handleSendMessage(threadId, prompt);
    return result;
}

async function handleSendMessage(threadId, prompt) {
    await createMessage(threadId, prompt);

    const run = await runAssistant(assistantId, threadId);
    const runId = run.id;

    return new Promise((resolve, reject) => {
        pollingIntervals[threadId] = setInterval(async () => {
            try {
                const response = await checkingStatus(threadId, runId);
                if (response) {
                    clearInterval(pollingIntervals[threadId]);
                    const cleanedResponse = response.replace(/【\d+:\d+†[^】]+】/g, '');
                    let chatHistory = {
                        "time": Date.now(),
                        "prompt": prompt,
                        "ai": cleanedResponse
                    };
                    // addChatHistory(chatHistory);
                    // addToGist(chatHistory);
                    resolve(cleanedResponse);
                }
            } catch (error) {
                reject(error);
            }
        }, 5000);
    });
}

async function initialize() {
    userThreads = await loadUserThreads();
}

module.exports = { sendMessage, initialize };
