// All-in-one password hashing system
// Warning: For educational purposes only. In production, use established cryptographic libraries.






























































































































































































































































































  /* Example usage:
  const password = "MySecretPass123";
  const { hash, salt } = passwordSystem.hashPassword(password);
  console.log('Hash:', hash);
  console.log('Salt:', salt);
  
  // Verify password
  const isValid = passwordSystem.verifyPassword(password, hash, salt);
  console.log('Valid:', isValid); // true
  
  // Unhash (educational purposes only)
  const originalPassword = passwordSystem.unhashPassword(hash, salt);
  console.log('Original:', originalPassword);
  */



//

function login() {
    const username = document.getElementById("uname").value;
    message = document.getElementById("msg")
    if (username == "" ) {

      message.style.color = "red"
        message.innerHTML = `Please enter your username`
        setTimeout(() => {
            message.style.color = "white"
        message.innerHTML = ``
        },5000)
        

    } 
    else if (username.length<3 || username.length>12) {
      message.style.color = "red"
      message.innerHTML = `Your username must be between 3 to 12 letters`
      setTimeout(() => {
          message.style.color = "white"
      message.innerHTML = ``
      },5000)
    
        } 
    else {
        
      message.style.color = "green" 
      message.innerHTML = `Logged In, Welcome ${username}!`
      setTimeout(() => {
          message.style.color = "white"
      message.innerHTML = ``
      },5000) 
        localStorage.setItem("uname",username) 
        setTimeout(()=> {
          localStorage.setItem("login","yes") 
          window.location.replace("home.html")
        },2000)
    }
}  