function redirectToLogin() {
    showLogin();
}



function showLogin() {
    const login = document.getElementsByClassName('sidebar');
    const signup = document.getElementsByClassName('signupModal');
    if (login) {
        login.classList.remove('hidden');
        clearMessages();
    }
    if (signup) signup.classList.add('hidden');
}



function closeAuthModal() {
    const login = document.getElementsByClassName('sidebar');
    const signup = document.getElementsByClassName('signupModal');
    if (login) login.classList.add('hidden');
    if (signup) signup.classList.add('hidden');
    clearMessages();
}

function showMessage(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="${type}-message">${message}</div>`;
    }
}

function clearMessages() {
    const msg1 = document.getElementsByClassName('sidebar');
    
    if (msg1) msg1.innerHTML = '';
    if (msg2) msg2.innerHTML = '';
}
let isModalOpen = false; // حالة مبدئية: النافذة مغلقة

function toggleAuthModal() {
  if (isModalOpen) {
    closeAuthModal();
    isModalOpen = false;
  } else {
    showLogin();
    isModalOpen = true;
  }
}


