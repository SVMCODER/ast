// Initialize history for shared and received items
let sharedHistory = [];
let receivedHistory = [];

// Utility function to update history UI
function updateHistory() {
    let historyContent = document.getElementById("history-content");
    historyContent.innerHTML = '';

    // Show shared history
    sharedHistory.forEach(item => {
        let card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="username">Share Code: ${item.code}</div>
            <div class="buttons">
                <button class="copy-btn" onclick="copyCode('${item.code}')">Copy</button>
                <button class="copy-btn" onclick="downloadFile('${item.code}')">Download</button>
            </div>
        `;
        historyContent.appendChild(card);
    });

    // Show received history (if any)
    receivedHistory.forEach(item => {
        let card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="username">Received File: ${item.code}</div>
            <div class="buttons">
                <button class="copy-btn" onclick="copyCode('${item.code}')">Copy</button>
            </div>
        `;
        historyContent.appendChild(card);
    });
}

// Open the popup for creating or receiving file
function openPopup(isCreate) {
    document.getElementById("popup").style.display = 'block';
    document.getElementById("msg").textContent = isCreate ? "Generate your share code" : "Enter share code to receive file";
    document.getElementById("shareCode").value = '';
    document.getElementById("loading").style.display = 'none';
}

// Handle submit for generating or receiving a share code
document.getElementById("submitBtn").addEventListener('click', async function() {
    const shareCode = document.getElementById("shareCode").value.trim();
    if (!shareCode) {
        showDialog('Please enter a valid code.');
        return;
    }

    // Show loading animation
    document.getElementById("loading").style.display = 'inline-block';

    // Simulate network request (could be replaced with an actual API call)
    setTimeout(async function() {
        document.getElementById("loading").style.display = 'none';
        document.getElementById("popup").style.display = 'none';

        // Custom "hashing" method
        const hashedCode = base64Encode(shareCode);

        // Add to shared history or received history based on context
        if (document.getElementById("msg").textContent.includes('Generate')) {
            sharedHistory.push({ code: hashedCode });
            const encodedFile = encodeFileToBase64(hashedCode);
            sharedHistory[sharedHistory.length - 1].file = encodedFile;
        } else {
            receivedHistory.push({ code: hashedCode });
            // Optionally, you could fetch the file from a server here if needed
        }

        // Update history UI
        updateHistory();
    }, 2000);
});

// Custom "hashing" function (simply Base64 encoding)
function base64Encode(text) {
    let encoded = btoa(unescape(encodeURIComponent(text)));  // Encoding string to base64
    return encoded;
}

// Custom "unhashing" function (Base64 decoding)
function base64Decode(encodedText) {
    let decoded = decodeURIComponent(escape(atob(encodedText)));  // Decoding from base64
    return decoded;
}

// Convert string to base64 for file sharing
function encodeFileToBase64(text) {
    let encoded = btoa(unescape(encodeURIComponent(text)));  // Encoding string to base64
    return encoded;
}

// Convert base64 to file object
function base64ToFile(base64) {
    let byteString = atob(base64);
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    let file = new Blob([uint8Array], { type: 'application/octet-stream' });
    return file;
}

// Show dialog box with a custom message
function showDialog(message) {
    const dialogBox = document.getElementById("dialogBox");
    document.getElementById("dialogMsg").textContent = message;
    dialogBox.style.display = 'block';

    // Close the dialog box when the button is clicked
    document.getElementById("dialogCloseBtn").onclick = function() {
        dialogBox.style.display = 'none';
    };
}

// Event listeners for buttons to create or receive file
document.getElementById("createBtn").addEventListener('click', function() {
    openPopup(true);
});

document.getElementById("receiveBtn").addEventListener('click', function() {
    openPopup(false);
});

// Function to copy share code to clipboard
function copyCode(code) {
    navigator.clipboard.writeText(code).then(function() {
        showDialog('Share code copied to clipboard!');
    }).catch(function() {
        showDialog('Failed to copy code.');
    });
}

// Function to simulate downloading a file (for now just log the action)
function downloadFile(code) {
    const historyItem = sharedHistory.find(item => item.code === code);
    if (historyItem && historyItem.file) {
        // Create a file from the base64 string
        const file = base64ToFile(historyItem.file);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = 'shared_file.txt'; // Name of the downloaded file
        a.click();
    } else {
        showDialog('No file available for this share code.');
    }
}
