function msg(text) {
    const popup = document.getElementById("popup");
    const body = document.getElementById("body");
    body.style.opacity = 0.2;
    body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";

    popup.innerHTML = text;
    popup.showModal();
}

function close() {
    const popup = document.getElementById("popup");
    const body = document.getElementById("body");
    body.style.opacity = 1;
    body.style.pointerEvents = "all";
    document.body.style.overflow = "scroll";

    popup.innerHTML = "";
    popup.close();
}

function create() {
    let html = `
    <div class="text">Create new Key</div>
    <input id="file" type="file" placeholder="Select Your File">
    <div id="msg" style="text-align: left; padding-left: 4px;color: red;"></div>
    <button onclick="save()">Create Key</button>
    <div class="loading" id="loading" style="display:none;">Generating...</div>
    `;
    msg(html);
}

function save() {
    const fileInput = document.getElementById("file");
    const loading = document.getElementById("loading");

    if (fileInput.value !== "") {
        loading.style.display = "block";  // Show loading text
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const base64 = event.target.result.split(',')[1]; // Extract base64 part

            const passwordSystem = new PasswordSystem();
            const { hash, salt } = passwordSystem.hashPassword(base64);

            const history = localStorage.getItem("shareHistory") || '';
            const newHistory = `
            <div class="history-card">
                <p class="username">${file.name}</p>
                <div class="buttons">
                    <div class="copy-btn" onclick="copyToClipboard('${hash}')">Copy Share Code</div>
                    <div class="download-btn" onclick="downloadFile('${base64}', '${file.name}')">Download</div>
                </div>
            </div>
            `;
            localStorage.setItem("shareHistory", history + newHistory);
            loadShareHistory();
            close();
            loading.style.display = "none";  // Hide loading text
        };

        reader.readAsDataURL(file);
    } else {
        document.getElementById("msg").innerText = "Please select a file";
    }
}

function copyToClipboard(shareCode) {
    navigator.clipboard.writeText(shareCode);
    alert("Share Code Copied!");
}

function downloadFile(base64, filename) {
    const link = document.createElement("a");
    link.href = "data:application/octet-stream;base64," + base64;
    link.download = "ast-" + filename;
    link.click();
}

function loadShareHistory() {
    const shareHistory = localStorage.getItem("shareHistory") || `<i class='bx bx-history' style="font-size: 200px;text-align: center;justify-content: center;"></i>
    <h1 class="ss">You haven't created any keys yet!</h1>`;
    document.getElementById("shareHistory").innerHTML = shareHistory;
}

function loadReceiveHistory() {
    const receiveHistory = localStorage.getItem("receivedHistory") || `<i class='bx bx-history' style="font-size: 200px;text-align: center;justify-content: center;"></i>
    <h1 class="ss">You haven't received any keys yet!</h1>`;
    document.getElementById("receiveHistory").innerHTML = receiveHistory;
}

function receive() {
    let html = `
    <div class="text">Enter Share Code</div>
    <input id="shareCode" type="text" placeholder="Enter Share Code">
    <button onclick="receiveKey()">Receive Key</button>
    <div class="loading" id="loading" style="display:none;">Generating...</div>
    `;
    msg(html);
}

function receiveKey() {
    const shareCode = document.getElementById("shareCode").value;
    const loading = document.getElementById("loading");

    if (shareCode) {
        loading.style.display = "block";  // Show loading text

        const passwordSystem = new PasswordSystem();
        const salt = "yourSalt"; // Should be retrieved with share code
        const originalFile = passwordSystem.unhashPassword(shareCode, salt);
        
        const history = localStorage.getItem("receivedHistory") || '';
        const newHistory = `
        <div class="history-card">
            <p class="username">Received: ${originalFile}</p>
            <div class="buttons">
                <div class="download-btn" onclick="downloadFile('${originalFile}')">Download</div>
            </div>
        </div>
        `;
        localStorage.setItem("receivedHistory", history + newHistory);
        loadReceiveHistory();
        close();
        loading.style.display = "none";  // Hide loading text
    } else {
        alert("Please enter a share code.");
    }
}

loadShareHistory();
loadReceiveHistory();
    
