const axios = require('axios');
const fs = require('fs');

const GIST_ID = process.env.GISTS_ID_LIMU_AI;
const GITHUB_TOKEN = process.env.GISTS_API;

// Function to fetch the Gist content
async function fetchGistContent(gistId, token) {
    try {
        const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch gist: ${error.response.status}`);
        return null;
    }
}

// Function to update the Gist content
async function updateGist(gistId, token, content) {
    try {
        const response = await axios.patch(
            `https://api.github.com/gists/${gistId}`,
            {
                files: {
                    'limuai.json': {
                        content: JSON.stringify(content, null, 2)
                    }
                }
            },
            {
                headers: {
                    Authorization: `token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Gist updated successfully!');
    } catch (error) {
        console.error(`Failed to update gist: ${error.response.status}`);
    }
}

// Fetch the existing Gist content
async function updateThreads(threadID) {
    const gist = await fetchGistContent(GIST_ID, GITHUB_TOKEN);
    if (gist) {
        const gistContent = JSON.parse(gist.files['limuai.json'].content);

        // Modify the content
        gistContent.thread.push(threadID);

        // Update the Gist with new content
        await updateGist(GIST_ID, GITHUB_TOKEN, gistContent);
    }
}

module.exports = updateThreads;