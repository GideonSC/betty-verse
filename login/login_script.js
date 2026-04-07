const loginPassword = document.getElementById('loginPassword');
const registerPassword = document.getElementById('registerPassword');
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');

function togglePassword(input, toggleBtn) {
    if (!input || !toggleBtn) {
        return;
    }

    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const icon = toggleBtn.querySelector('i');
    if (!icon) {
        return;
    }

    icon.className = type === 'password' ? 'bx bx-hide' : 'bx bx-show';
}

if (loginToggle && loginPassword) {
    loginToggle.addEventListener('click', () => {
        togglePassword(loginPassword, loginToggle);
    });
}

if (registerToggle && registerPassword) {
    registerToggle.addEventListener('click', () => {
        togglePassword(registerPassword, registerToggle);
    });
}
