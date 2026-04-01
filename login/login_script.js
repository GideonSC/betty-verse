// Login/Signup Form Toggle Script
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Password toggle functionality
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');
const loginPassword = document.getElementById('loginPassword');
const registerPassword = document.getElementById('registerPassword');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Password visibility toggle
loginToggle.addEventListener('click', () => {
    togglePassword(loginPassword, loginToggle);
});

registerToggle.addEventListener('click', () => {
    togglePassword(registerPassword, registerToggle);
});

function togglePassword(input, toggleBtn) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    const icon = toggleBtn.querySelector('i');
    if (type === 'password') {
        icon.className = 'bx bx-hide';
    } else {
        icon.className = 'bx bx-show';
    }
}