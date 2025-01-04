function msg(htmlContent) {
    const popup = document.getElementById("popup");
    document.getElementById("body").style.opacity = 0.2;
    document.getElementById("body").style.pointerEvents = "none";
    document.body.style.overflow = "hidden";
    popup.innerHTML = htmlContent;
    popup.show();
}

function closeDialog() {
    const popup = document.getElementById("popup");
    document.getElementById("body").style.opacity = 1;
    document.getElementById("body").style.pointerEvents = "all";
    document.body.style.overflow = "scroll";
    popup.innerHTML = "";
    popup.close();
}

function create() {
    const html = `
        <div class="text">Create a new Key</div>
        <input id="file" type="file" placeholder="Select Your File">
        <div id="msg" style="text-align: left; padding-left: 4px;color: red;"></div>
        <button class="button" onclick="saveKey()">Create Key</button>
    `;
    msg(html);
}

function unhashDialog() {
    const html = `
        <div class="text">Enter Share Key</div>
        <input id="hashInput" type="text" placeholder="Enter Share Key">
        <div id="msg" style="text-align: left; padding-left: 4px;color: red;"></div>
        <button class="button" onclick="unhashKey()">Retrieve File</button>
    `;
    msg(html);
}

function showLoading(message) {
    const html = `
        <div class="loading">
            <div class="spinner"></div>
            <div>${message}</div>
        </div>
    `;
    msg(html);
}

function saveKey() {
    const fileInput = document.getElementById("file").files[0];
    if (!fileInput) {
        document.getElementById("msg").innerText = "Please select a file";
        return;
    }
    showLoading("Processing file...");
    fileToBase64(fileInput, (base64) => {
        const passwordSystem = new PasswordSystem();
        const { hash } = passwordSystem.hashPassword(base64);

        const historyEntry = `
            <div class="history-card">
                <p class="username">${fileInput.name}</p>
                <div class="buttons">
                    <div class="copy-btn button" onclick="navigator.clipboard.writeText('${hash}');this.innerText='Copied';setTimeout(()=>{this.innerText='Copy Key';},2000);">Copy Share Key</div>
                    <button class="button" onclick="base64ToFile('${base64}', '${fileInput.name}', '${fileInput.type}')">Download</button>
                </div>
            </div>
        `;

        const sharedHistory = localStorage.getItem("sharedHistory") || "";
        localStorage.setItem("sharedHistory", sharedHistory + historyEntry);
        loadHistory();
        closeDialog();
    });
}

function unhashKey() {
    const hashInput = document.getElementById("hashInput").value;
    if (!hashInput) {
        document.getElementById("msg").innerText = "Please enter a share key";
        return;
    }
    showLoading("Retrieving file...");
    const history = document.getElementById("shared-history").children;
    for (let i = 0; i < history.length; i++) {
        const data = history[i].querySelector("div[data-hash]");
        if (data && data.dataset.hash === hashInput) {
            const base64 = data.dataset.base64;
            const filename = data.dataset.filename;
            const filetype = data.dataset.filetype;

            const receivedEntry = `
                <div class="history-card">
                    <p class="username">${filename}</p>
                    <div class="buttons">
                        <button class="button" onclick="base64ToFile('${base64}', '${filename}', '${filetype}')">Download</button>
                    </div>
                </div>
            `;
            const receivedHistory = localStorage.getItem("receivedHistory") || "";
            localStorage.setItem("receivedHistory", receivedHistory + receivedEntry);

            loadHistory();
            closeDialog();
            return;
        }
    }
    document.getElementById("msg").innerText = "Invalid share key.";
}

function loadHistory() {
    const sharedHistory = localStorage.getItem("sharedHistory") || `<h1 class="ss">You haven't shared any keys yet!</h1>`;
    const receivedHistory = localStorage.getItem("receivedHistory") || `<h1 class="ss">You haven't received any keys yet!</h1>`;
    document.getElementById("shared-history").innerHTML = sharedHistory;
    document.getElementById("received-history").innerHTML = receivedHistory;
}

function fileToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
}

function base64ToFile(base64, filename, filetype) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length).fill().map((_, i) => slice.charCodeAt(i));
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: filetype });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

loadHistory();
                      
