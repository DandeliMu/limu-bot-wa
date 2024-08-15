const axios = require('axios');

// GitHub Personal Access Token
const token = process.env.GISTS_API;
// The ID of the Gist you want to update
const gistId = process.env.GISTS_ID_CHAT_HISTORY;

// Function to fetch existing Gist data
async function fetchGist() {
    try {
        const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.data.files['chatHistory.json'].content;
    } catch (error) {
        console.error('Error fetching Gist data:', error);
        return '{}'; // Return an empty JSON object if there's an error
    }
}

// Function to update a GitHub Gist
async function updateGist(updatedContent) {
    const url = `https://api.github.com/gists/${gistId}`;
    const gistData = {
        files: {
            'chatHistory.json': {
                content: updatedContent
            }
        }
    };

    try {
        const response = await axios.patch(url, gistData, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        // console.log('Gist updated:', response.data.html_url);
    } catch (error) {
        console.error('Error updating Gist:', error);
    }
}

// Function to add new data to the Gist
async function addToGist(newEntry) {
    // Fetch existing Gist data
    const existingData = JSON.parse(await fetchGist());

    // Add new entry
    existingData[newEntry.time] = {
        [newEntry.user]: newEntry.prompt,
        limu: newEntry.ai
    };

    // Convert the updated data back to a JSON string
    const updatedContent = JSON.stringify(existingData, null, 4);

    // Update the Gist
    await updateGist(updatedContent);
}

// Example usage
// let chatHistory = {
//     time: Date.now(),
//     user: "btw limu udah kenal sama siapa aja?",
//     ai: "Aku udah kenal sama beberapa anggota DandeliMu, seperti Kanami, Akmal, Odo, Junius, Bambang, dan Epan. Masing-masing punya keunikan dan hobi tersendiri! Kamu kenal sama siapa aja? 😄✨"
// };

module.exports = addToGist;
// addToGist(chatHistory);
