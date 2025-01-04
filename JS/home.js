// Function to show a popup
function msg(text) {
  const popup = document.getElementById("popup");
  document.getElementById("body").style.opacity = 0.2;
  document.getElementById("body").style.pointerEvents = "none";
  document.body.style.overflow = "hidden";

  popup.innerHTML = text;
  popup.show();
}

// Function to close the popup
function close() {
  const popup = document.getElementById("popup");
  document.getElementById("body").style.opacity = 1;
  document.getElementById("body").style.pointerEvents = "all";
  document.body.style.overflow = "scroll";
  popup.innerHTML = "";
  popup.close();
}

// Sender: Create a new key
function create() {
  const html = `
    <div class="text">Create a new Key</div>
    <input id="file" type="file" placeholder="Select Your File">
    <div id="msg" style="text-align: left; padding-left: 4px; color: red;"></div>
    <button onclick="saveKey()">Create Key</button>
  `;
  msg(html);
}

// Receiver: Unhash a key
function unhashKeyPopup() {
  const html = `
    <div class="text">Unhash Key</div>
    <textarea id="hashInput" placeholder="Enter Share Code"></textarea>
    <div id="msg" style="text-align: left; padding-left: 4px; color: red;"></div>
    <button onclick="unhashKey()">Unhash Key</button>
  `;
  msg(html);
}

// Convert file to Base64
function fileToBase64(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result.split(",")[1]);
  reader.readAsDataURL(file);
}

// Save key for sender
function saveKey() {
  const fileInput = document.getElementById("file").files[0];
  if (!fileInput) {
    document.getElementById("msg").innerText = "Please select a file";
    return;
  }

  fileToBase64(fileInput, (base64) => {
    const passwordSystem = new PasswordSystem();
    const { hash, salt } = passwordSystem.hashPassword(base64);

    // Save to history
    const historyEntry = `
      <div class="history-card">
        <p class="username">${fileInput.name}</p>
        <div class="buttons">
          <div class="copy-btn" onclick="navigator.clipboard.writeText('${hash}');this.innerText='Copied';setTimeout(()=>{this.innerText='Copy Code';},2000);">Copy Share Code</div>
          <div class="download-btn" onclick="base64ToFile('${base64}', '${fileInput.name}', '${fileInput.type}')">Download File</div>
        </div>
        <div style="display:none;" data-hash="${hash}" data-salt="${salt}" data-filename="${fileInput.name}" data-filetype="${fileInput.type}" data-base64="${base64}"></div>
      </div>
    `;

    const history = localStorage.getItem("history") || "";
    localStorage.setItem("history", history + historyEntry);
    loadHistory();
    document.getElementById("msg").style.color = "green";
    document.getElementById("msg").innerText = "Key created successfully!";
    setTimeout(close, 2000);
  });
}

// Unhash key for receiver
function unhashKey() {
  const hashInput = document.getElementById("hashInput").value;
  if (!hashInput) {
    document.getElementById("msg").innerText = "Please enter a share code";
    return;
  }

  const history = document.getElementById("history").children;
  for (let i = 0; i < history.length; i++) {
    const data = history[i].querySelector("div[data-hash]");
    if (data && data.dataset.hash === hashInput) {
      const base64 = data.dataset.base64;
      const filename = data.dataset.filename;
      const filetype = data.dataset.filetype;

      base64ToFile(base64, filename, filetype);
      document.getElementById("msg").style.color = "green";
      document.getElementById("msg").innerText = "File retrieved successfully!";
      setTimeout(close, 2000);
      return;
    }
  }

  document.getElementById("msg").innerText = "Invalid share code";
}

// Convert Base64 back to file and download
function base64ToFile(base64, fileName, fileType) {
  const blob = new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type: fileType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

// Load history from localStorage
function loadHistory() {
  const history = localStorage.getItem("history") || `
    <i class='bx bx-history' style="font-size: 200px; text-align: center; justify-content: center;"></i>
    <h1 class="ss">You haven't created any keys yet!</h1>
  `;
  document.getElementById("history").innerHTML = history;
}

// Initialize history
loadHistory();

// PasswordSystem class (same as your provided implementation)
class PasswordSystem {
  constructor() {
    this.CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    this.ROUNDS = 10;
    this.PRIME1 = 31;
    this.PRIME2 = 37;
  }

  #generateSalt() {
    let salt = "";
    for (let i = 0; i < 16; i++) {
      salt += this.CHARSET[Math.floor(Math.random() * this.CHARSET.length)];
    }
    return salt;
  }

  #complexify(input, salt) {
    const combined = input + salt;
    let result = "";
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      const shifted = ((char << 5) ^ (char >> 3)) & 0xff;
      const mixed = (shifted * this.PRIME1 + this.PRIME2) % 256;
      result += mixed.toString(16).padStart(2, "0");
    }
    return result;
  }

  #transform(input) {
    let result = input;
    for (let i = 0; i < this.ROUNDS; i++) {
      result = result.split("").reverse().join("");
      result = btoa(result).replace(/=/g, "");
      result = result
        .split("")
        .map((char, index) => String.fromCharCode((char.charCodeAt(0) + index + 1) % 128))
        .join("");
    }
    return result;
  }

  hashPassword(password) {
    const salt = this.#generateSalt();
    const complex = this.#complexify(password, salt);
    const transformed = this.#transform(complex);
    const hash = (transformed + salt).slice(0, 8);
    return { hash, salt };
  }
                                                       }
    
