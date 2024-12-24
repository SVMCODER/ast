function msg(text) {
  const popup = document.getElementById("popup")
  document.getElementById("body").style.opacity = 0.2
  document.getElementById("body").style.pointerEvents = "none";
  document.body.style.overflow = "hidden";
  
  popup.innerHTML = text 
  popup.show()      
}    
function close() {
  const popup = document.getElementById("popup")
  document.getElementById("body").style.opacity = 1
  document.getElementById("body").style.pointerEvents = "all";
  document.body.style.overflow = "scroll";
  popup.innerHTML = ""   
  popup.close()  
}
function create() {     
  html =    ` 
  <div class="text">Create new AstKey</div>
        <input id="pass" placeholder="Password">
        <div id="msg" style="text-align: left; padding-left: 4px;color: red;"></div>
        <button onclick="save()">Hash now</button> 
  `
  msg(html)
}
 
function save() {
if (document.getElementById("pass").value !== "" && document.getElementById("pass").value.length > 4 && document.getElementById("pass").value.length < 12) {
  const passwordSystem = new PasswordSystem();
  const password = document.getElementById("pass").value;
  const { hash, salt } = passwordSystem.hashPassword(password);
  console.log('Hash:', hash);
  console.log('Salt:', salt);
const dataset = localStorage.getItem("history")? localStorage.getItem("history") + ` 
<div class="history-card"> 
    <p class="username">${document.getElementById("pass").value}</p>
    <div class="buttons"> 
      <div class="copy-btn" onclick="navigator.clipboard.writeText('${hash}');this.innerText = 'Copied';setTimeout(()=> {this.innerText = 'Copy Hash';this.style.background = '#006eff'},2000);this.style.background = 'green'">Copy Hash</div> 
      <div class="copy-btn" onclick="navigator.clipboard.writeText('${salt}');this.innerText = 'Copied';setTimeout(()=> {this.innerText = 'Copy Salt';this.style.background = '#006eff'},2000);this.style.background = 'green'">Copy Salt</div> 
    </div>
  </div>
`: `
<div class="history-card"> 
    <p class="username">${document.getElementById("pass").value}</p>
    <div class="buttons">
      <div class="copy-btn" onclick="navigator.clipboard.writeText('${hash}');this.innerText = 'Copied';setTimeout(()=> {this.innerText = 'Copy Hash';this.style.background = '#006eff'},2000);this.style.background = 'green'">Copy Hash</div> 
      <div class="copy-btn" onclick="navigator.clipboard.writeText('${salt}');this.innerText = 'Copied';setTimeout(()=> {this.innerText = 'Copy Salt';this.style.background = '#006eff'},2000);this.style.background = 'green'">Copy Salt</div> 
    </div>
  </div>
`

document.getElementById("pass").value ? document.getElementById("pass").value : document.getElementById("msg").innerText = "Cannot be empty!"; localStorage.setItem("history", dataset)
document.getElementById("msg").style.color = "green" 
document.getElementById("msg").innerHTML = "<div class='flex'><div class='load'></div>Securing your password!</div>" 

setTimeout(() => { 
  load()
  close()
 }, 2000);
} 
else {
  document.getElementById("msg").innerText = "Make password length: 4-12" 
}
} 
function load() {
  const history = localStorage.getItem("history") ? localStorage.getItem("history") : `<i class='bx bx-history' t style="font-size: 200px;text-align: center;justify-content: center;"></i>
            <h1 class="ss">You haven't created any keys yet!</h1>` 
  document.getElementById("history").innerHTML = history
}
load()

{/* <div class="history-card"> 
          <p class="username">Shaurya6</p>
          <div class="buttons">
            <div class="copy-btn">Copy Hash</div>
            <div class="copy-btn">Copy Salt</div>
          </div>
        </div> */} 


        class PasswordSystem {
          constructor() {
            this.CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
            this.ROUNDS = 10;
            this.PRIME1 = 31;
            this.PRIME2 = 37;
          }
        
          // Generate a random salt for additional security
          #generateSalt() {
            let salt = '';
            for (let i = 0; i < 16; i++) {
              salt += this.CHARSET[Math.floor(Math.random() * this.CHARSET.length)];
            }
            return salt;
          }
        
          // Complex transformation using bit manipulation
          #complexify(input, salt) {
            const combined = input + salt;
            let result = '';
            
            for (let i = 0; i < combined.length; i++) {
              const char = combined.charCodeAt(i);
              const shifted = ((char << 5) ^ (char >> 3)) & 0xFF;
              const mixed = (shifted * this.PRIME1 + this.PRIME2) % 256;
              result += mixed.toString(16).padStart(2, '0');
            }
            
            return result;
          }
        
          // Reverse the complexification process
          #decomplexify(input, salt) {
            const hexPairs = input.match(/.{1,2}/g) || [];
            let result = '';
            
            for (let i = 0; i < hexPairs.length; i++) {
              const mixed = parseInt(hexPairs[i], 16);
              // Find original char using modular multiplicative inverse
              let original;
              for (let j = 0; j < 256; j++) {
                if ((j * this.PRIME1 + this.PRIME2) % 256 === mixed) {
                  original = j;
                  break;
                }
              }
              if (original !== undefined) {
                const unshifted = ((original << 3) ^ (original >> 5)) & 0xFF;
                result += String.fromCharCode(unshifted);
              }
            }
            
            return result.slice(0, -salt.length);
          }
        
          // Multiple rounds of transformation
          #transform(input) {
            let result = input;
            for (let i = 0; i < this.ROUNDS; i++) {
              // Round 1: Reverse the string
              result = result.split('').reverse().join('');
              
              // Round 2: Base64 encode and remove padding
              result = btoa(result).replace(/=/g, '');
              
              // Round 3: Character shifting based on position
              result = result.split('').map((char, index) => {
                const code = char.charCodeAt(0);
                return String.fromCharCode((code + index + 1) % 128);
              }).join('');
            }
            return result;
          }
        
          // Reverse the transformation process
          #reverseTransform(input) {
            let result = input;
            for (let i = this.ROUNDS - 1; i >= 0; i--) {
              // Reverse Round 3: Character shifting
              result = result.split('').map((char, index) => {
                const code = char.charCodeAt(0);
                return String.fromCharCode((code - index - 1 + 128) % 128);
              }).join('');
              
              // Reverse Round 2: Base64 decode
              try {
                result = atob(result + '==');
              } catch {
                result = atob(result + '=');
              }
              
              // Reverse Round 1: Reverse string
              result = result.split('').reverse().join('');
            }
            return result;
          }
        
          // Main hashing function
          hashPassword(password) {
            if (typeof password !== 'string') {
              throw new Error('Password must be a string');
            }
            
            const salt = this.#generateSalt();
            const complex = this.#complexify(password, salt);
            const transformed = this.#transform(complex);
            
            // Ensure exactly 8 characters output
            const hash = (transformed + salt).slice(0, 8);
            
            return {
              hash,
              salt
            };
          }
        
      
          verifyPassword(password, hash, salt) {
            const complex = this.#complexify(password, salt);
            const transformed = this.#transform(complex);
            const testHash = (transformed + salt).slice(0, 8);
            
            return testHash === hash;
          }
        
           
          unhashPassword(hash, salt) {
           
            const transformedPart = hash.slice(0, 8);
            const uncomplexified = this.#decomplexify(transformedPart, salt);
            return this.#reverseTransform(uncomplexified);
          }
        }
        close()
       
        