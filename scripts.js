document.getElementById('getStartedButton').addEventListener('click', () => {
    document.getElementById('videoForm').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('videoForm').onsubmit = function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Show the progress bar when submit is clicked
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = '0%'; // Reset progress
    progressBar.closest('.progress').style.visibility = 'visible';

    // Use fetch to send the formData and handle progress updates
    fetch('/query', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('extractedText').textContent = "Extracted Text: " + data.result;
        progressBar.style.width = '100%'; // Ensure completion on successful data fetch
    })
    .catch(error => {
        console.error('Error:', error);
        progressBar.style.width = '100%'; // Assume completion on error
    })
    .finally(() => {
        setTimeout(() => {
            // Hide the progress bar after a short delay to show completion
            progressBar.closest('.progress').style.visibility = 'hidden';
            progressBar.style.width = '0%'; // Reset progress for next use
        }, 1000);
    });
};

function sendMessage() {
    const userInput = document.getElementById('user_input').value;
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({user_input: userInput})
    })
    .then(response => response.json())
    .then(data => {
        const chatHistory = document.getElementById('chat_history');
        const userLi = document.createElement('li');
        userLi.innerHTML = `<strong>User:</strong> ${userInput}`;
        const botLi = document.createElement('li');
        botLi.innerHTML = `<strong>Gemini Bot:</strong> ${data.gemini_response}`;
        chatHistory.appendChild(userLi);
        chatHistory.appendChild(botLi);
        document.getElementById('user_input').value = '';  // Clear input box
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('copyText').addEventListener('click', function() {
    const extractedText = document.getElementById('extractedText').innerText;
    navigator.clipboard.writeText(extractedText).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

document.getElementById('pasteText').addEventListener('click', function() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('user_input').value = text;
    }).catch(err => {
        console.error('Failed to paste text: ', err);
    });
});
