// DOM Elements
const shareBtn = document.getElementById('shareBtn');
const receiveBtn = document.getElementById('receiveBtn');
const modal = document.getElementById('modal');
const fileInput = document.getElementById('fileInput');
const sendBtn = document.getElementById('sendBtn');
const sentHistory = document.getElementById('sentHistory');
const receivedHistory = document.getElementById('receivedHistory');

// Event Listeners
shareBtn.addEventListener('click', openModal);
receiveBtn.addEventListener('click', receiveFile);
sendBtn.addEventListener('click', shareFile);
window.addEventListener('click', closeModalOutside);

// Open modal
function openModal() {
    modal.style.display = 'block';
}

// Close modal when clicking outside
function closeModalOutside(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Generate 6-digit code from Base64 data
function generateCode(base64) {
    let hash = 0;
    for (let i = 0; i < base64.length; i++) {
        const char = base64.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash % 1000000).toString().padStart(6, '0');
}

// Reverse 6-digit code to Base64 data (simplified for demo)
function reverseCode(code) {
    // In a real implementation, this would be a more complex reversible algorithm
    return atob(code);
}

// Share file
function shareFile() {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result.split(',')[1];
            const code = generateCode(base64);
            saveToHistory('sent', file.name, code);
            modal.style.display = 'none';
            alert(`Your share code is: ${code}`);
        };
        reader.readAsDataURL(file);
    }
}

// Receive file
function receiveFile() {
    const code = prompt('Enter the 6-digit share code:');
    if (code && code.length === 6) {
        try {
            const base64 = reverseCode(code);
            const fileName = `received_file_${Date.now()}`;
            saveToHistory('received', fileName, code);
            alert('File received successfully!');
        } catch (error) {
            alert('Invalid share code. Please try again.');
        }
    }
}

// Save to history
function saveToHistory(type, fileName, code) {
    const history = JSON.parse(localStorage.getItem(type + 'History')) || [];
    history.push({ fileName, code, timestamp: Date.now() });
    localStorage.setItem(type + 'History', JSON.stringify(history));
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    sentHistory.innerHTML = '';
    receivedHistory.innerHTML = '';

    const sentItems = JSON.parse(localStorage.getItem('sentHistory')) || [];
    const receivedItems = JSON.parse(localStorage.getItem('receivedHistory')) || [];

    sentItems.forEach(item => addHistoryItem(sentHistory, item));
    receivedItems.forEach(item => addHistoryItem(receivedHistory, item));
}

// Add history item
function addHistoryItem(container, item) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${item.fileName} (${new Date(item.timestamp).toLocaleString()})</span>
        <div>
            <button onclick="copyCode('${item.code}')">Copy Code</button>
            <button onclick="downloadFile('${item.code}', '${item.fileName}')">Download</button>
        </div>
    `;
    container.appendChild(li);
}

// Copy code to clipboard
function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    });
}

// Download file
function downloadFile(code, fileName) {
    try {
        const base64 = reverseCode(code);
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${base64}`;
        link.download = fileName;
        link.click();
    } catch (error) {
        alert('Error downloading file. Please try again.');
    }
}

// Initial history display
updateHistoryDisplay();

