const OpenAI = require("openai");
const { LIMUAI_KEY } = process.env;

const openai = new OpenAI({
    apiKey: "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"
});

let arr = ["thread_QYYhJ6AMNUTohezKNX9Z87ic"];

async function main(threadID) {
    const response = await openai.beta.threads.del(threadID);

    console.log(response);
}

for (const threadId of arr) {
    main(threadId);
}