import botResponses from './responses.js';

const loginButton = document.getElementById('loginButton');
const registerLink = document.getElementById('registerLink');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginSubmit = document.getElementById('loginSubmit');
const registerSubmit = document.getElementById('registerSubmit');
const googleLogin = document.getElementById('googleLogin');
const googleRegister = document.getElementById('googleRegister');
const microsoftLogin = document.getElementById('microsoftLogin');
const microsoftRegister = document.getElementById('microsoftRegister');
const githubLogin = document.getElementById('githubLogin');
const githubRegister = document.getElementById('githubRegister');
const settingsBtn = document.getElementById('settingsBtn');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const customAlert = document.getElementById('customAlert');
const alertMessage = document.getElementById('alertMessage');
const alertConfirm = document.getElementById('alertConfirm');
const alertCancel = document.getElementById('alertCancel');

let currentChatId = null;
let chats = [];
let isLoggedIn = false;

function addMessage(text, sender, chatId = currentChatId, id = Date.now(), isEdited = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    messageElement.dataset.id = id;
    messageElement.innerHTML = `
        <span class="message-text">${text}</span>
        ${sender === 'user' ? `
            <div class="message-actions">
                <button onclick="editMessage(${id})">Düzenle</button>
                <button onclick="deleteMessage(${id})">Sil</button>
            </div>
        ` : ''}
        ${isEdited ? '<span class="edited-indicator">(düzenlendi)</span>' : ''}
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
        chats[chatIndex].messages.push({ 
            id, 
            text, 
            sender,
            versions: [{ text, timestamp: Date.now() }]
        });
    }

    saveChats();
}

function getResponse(input) {
    const lowercaseInput = input.toLowerCase();
    for (const key in botResponses) {
        if (lowercaseInput.includes(key)) {
            return botResponses[key];
        }
    }
    return botResponses.default;
}

function handleSendMessage() {
    const message = userInput.value.trim();
    if (message) {
        const messageId = Date.now();
        addMessage(message, 'user', currentChatId, messageId);
        userInput.value = '';

        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response, 'ai', currentChatId);
        }, 500);
    }
}

function startNewChat() {
    currentChatId = Date.now();
    const newChat = {
        id: currentChatId,
        messages: []
    };
    chats.unshift(newChat);
    chatMessages.innerHTML = '';
    saveChats();
    updateChatHistoryDisplay();
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
    updateChatHistoryDisplay();
}

function loadChats() {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
        updateChatHistoryDisplay();
        if (chats.length > 0) {
            loadChat(chats[0].id);
        } else {
            startNewChat();
        }
    } else {
        startNewChat();
    }
}

function updateChatHistoryDisplay() {
    chatHistory.innerHTML = '<h3>Sohbet Geçmişi</h3>';
    if (chats.length === 0) {
        chatHistory.innerHTML += '<p>Henüz hiç konuşmadınız</p>';
        return;
    }
    chats.forEach((chat) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        const firstMessage = chat.messages[0] ? chat.messages[0].text : 'Boş sohbet';
        historyItem.innerHTML = `
            <span class="history-item-text" onclick="loadChat(${chat.id})">${firstMessage.substring(0, 30)}...</span>
            <div class="history-item-menu">
                <button class="history-item-menu-button" onclick="toggleMenu(${chat.id})">⋮</button>
                <div class="history-item-menu-content" id="menu-${chat.id}">
                    <a href="#" onclick="renameChat(${chat.id})">Yeniden Adlandır</a>
                    <a href="#" onclick="deleteChat(${chat.id})">Sil</a>
                    <a href="#" onclick="loadChat(${chat.id})">Aç</a>
                </div>
            </div>
        `;
        chatHistory.appendChild(historyItem);
    });

    if (chats.length > 0) {
        const deleteAllButton = document.createElement('button');
        deleteAllButton.textContent = 'Tüm Sohbetleri Sil';
        deleteAllButton.className = 'delete-all-button';
        deleteAllButton.onclick = deleteAllChats;
        chatHistory.appendChild(deleteAllButton);
    }
}

function toggleMenu(chatId) {
    const menu = document.getElementById(`menu-${chatId}`);
    const allMenus = document.querySelectorAll('.history-item-menu-content');
    allMenus.forEach(m => {
        if (m.id !== `menu-${chatId}`) {
            m.style.display = 'none';
        }
    });
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        chatMessages.innerHTML = '';
        chat.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', message.sender === 'user' ? 'user-message' : 'ai-message');
            messageElement.dataset.id = message.id;
            messageElement.innerHTML = `
                <span class="message-text">${message.text}</span>
                ${message.sender === 'user' ? `
                    <div class="message-actions">
                        <button onclick="editMessage(${message.id})">Düzenle</button>
                        <button onclick="deleteMessage(${message.id})">Sil</button>
                    </div>
                ` : ''}
                ${message.isEdited ? '<span class="edited-indicator">(düzenlendi)</span>' : ''}
                ${message.versions && message.versions.length > 1 ? `
                    <div class="version-controls">
                        <button onclick="showPreviousVersion(${message.id})">←</button>
                        <span class="version-number">1/${message.versions.length}</span>
                        <button onclick="showNextVersion(${message.id})">→</button>
                    </div>
                ` : ''}
            `;
            chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function deleteChat(chatId) {
    showCustomAlert('Bu sohbeti silmek istediğinizden emin misiniz?', () => {
        chats = chats.filter(chat => chat.id !== chatId);
        saveChats();
        if (currentChatId === chatId) {
            if (chats.length > 0) {
                loadChat(chats[0].id);
            } else {
                startNewChat();
            }
        }
    });
}

function renameChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        showCustomPrompt('Yeni sohbet adını girin:', chat.messages[0]?.text || 'Boş sohbet', (newName) => {
            if (newName && newName.trim() !== '') {
                if (chat.messages.length > 0) {
                    chat.messages[0].text = newName;
                } else {
                    chat.messages.push({ 
                        id: Date.now(), 
                        text: newName, 
                        sender: 'user',
                        versions: [{ text: newName, timestamp: Date.now() }]
                    });
                }
                saveChats();
            }
        });
    }
}

function editMessage(id) {
    const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
    const messageIndex = chats[chatIndex].messages.findIndex(message => message.id === id);
    const message = chats[chatIndex].messages[messageIndex];

    showCustomPrompt("Mesajınızı düzenleyin:", message.text, (newText) => {
        if (newText !== null && newText.trim() !== "" && newText !== message.text) {
            message.versions = message.versions || [];
            message.versions.push({ text: message.text, timestamp: Date.now() });
            message.text = newText;
            message.isEdited = true;
            
            // Remove subsequent messages
            chats[chatIndex].messages = chats[chatIndex].messages.slice(0, messageIndex + 1);
            
            // Get new AI response
            setTimeout(() => {
                const response = getResponse(newText);
                addMessage(response, 'ai', currentChatId);
            }, 500);
            
            saveChats();
            loadChat(currentChatId);
        }
    });
}

function showPreviousVersion(id) {
    const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
    const messageIndex = chats[chatIndex].messages.findIndex(message => message.id === id);
    const message = chats[chatIndex].messages[messageIndex];
    const currentVersionIndex = message.currentVersionIndex || message.versions.length - 1;
    
    if (currentVersionIndex > 0) {
        message.currentVersionIndex = currentVersionIndex - 1;
        message.text = message.versions[message.currentVersionIndex].text;
        loadChat(currentChatId);
    }
}

function showNextVersion(id) {
    const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
    const messageIndex = chats[chatIndex].messages.findIndex(message => message.id === id);
    const message = chats[chatIndex].messages[messageIndex];
    const currentVersionIndex = message.currentVersionIndex || message.versions.length - 1;
    
    if (currentVersionIndex < message.versions.length - 1) {
        message.currentVersionIndex = currentVersionIndex + 1;
        message.text = message.versions[message.currentVersionIndex].text;
        loadChat(currentChatId);
    }
}

function deleteMessage(id) {
    showCustomAlert('Bu mesajı silmek istediğinizden emin misiniz?', () => {
        const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
        if (chatIndex !== -1) {
            const messageIndex = chats[chatIndex].messages.findIndex(message => message.id === id);
            if (messageIndex !== -1) {
                chats[chatIndex].messages = chats[chatIndex].messages.slice(0, messageIndex);
                saveChats();
                loadChat(currentChatId);
            }
        }
    });
}

function showCustomAlert(message, onConfirm = null) {
    alertMessage.textContent = message;
    customAlert.style.display = 'block';
    
    alertConfirm.onclick = () => {
        customAlert.style.display = 'none';
        if (onConfirm) onConfirm();
    };
    
    alertCancel.onclick = () => {
        customAlert.style.display = 'none';
    };
}

function showCustomPrompt(message, defaultValue, onConfirm) {
    alertMessage.textContent = message;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.width = '100%';
    input.style.marginTop = '10px';
    alertMessage.appendChild(input);
    
    customAlert.style.display = 'block';
    
    alertConfirm.onclick = () => {
        customAlert.style.display = 'none';
        onConfirm(input.value);
        input.remove();
    };
    
    alertCancel.onclick = () => {
        customAlert.style.display = 'none';
        input.remove();
    };
}

function deleteAllChats() {
    showCustomAlert('Tüm sohbetleri silmek istediğinizden emin misiniz?', () => {
        chats = [];
        saveChats();
        currentChatId = null;
        chatMessages.innerHTML = '';
        updateChatHistoryDisplay();
    });
}

function showLoginModal() {
    loginModal.style.display = 'block';
    loginError.textContent = '';
}

function showRegisterModal() {
    registerModal.style.display = 'block';
    registerError.textContent = '';
}

function hideModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulating account check (replace with actual backend logic)
    const accountExists = Math.random() < 0.5; // 50% chance of account existing
    
    if (!accountExists) {
        loginError.textContent = 'Hesabınız yok ya da bulamıyoruz. Lütfen kayıt olun ya da bilgilerinizi kontrol ederek tekrar deneyin.';
    } else {
        // Proceed with login
        isLoggedIn = true;
        hideModals();
        loginButton.textContent = 'Oturum Açıldı';
        loginButton.disabled = true;
    }
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Implement registration logic here
    console.log('Register attempt:', username, email, password);
    
    // Simulating successful registration
    isLoggedIn = true;
    hideModals();
    loginButton.textContent = 'Oturum Açıldı';
    loginButton.disabled = true;
}

function handleSocialLogin(provider) {
    let url;
    switch(provider) {
        case 'Google':
            url = 'https://myaccount.google.com';
            break;
        case 'Microsoft':
            url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
            break;
        case 'GitHub':
            url = 'https://github.com';
            break;
    }
    window.location.href = url;
}

function handleSocialRegister(provider) {
    let url;
    switch(provider) {
        case 'Google':
            url = 'https://accounts.google.com/signup';
            break;
        case 'Microsoft':
            url = 'https://signup.live.com/';
            break;
        case 'GitHub':
            url = 'https://github.com/signup';
            break;
    }
    window.location.href = url;
}

function showSettings() {
    // Implement settings logic here
    console.log('Show settings');
}

// Event Listeners
sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});
newChatBtn.addEventListener('click', startNewChat);
loginButton.addEventListener('click', showLoginModal);
registerLink.addEventListener('click', showRegisterModal);
loginSubmit.addEventListener('click', handleLogin);
registerSubmit.addEventListener('click', handleRegister);
googleLogin.addEventListener('click', () => handleSocialLogin('Google'));
microsoftLogin.addEventListener('click', () => handleSocialLogin('Microsoft'));
githubLogin.addEventListener('click', () => handleSocialLogin('GitHub'));
googleRegister.addEventListener('click', () => handleSocialRegister('Google'));
microsoftRegister.addEventListener('click', () => handleSocialRegister('Microsoft'));
githubRegister.addEventListener('click', () => handleSocialRegister('GitHub'));
settingsBtn.addEventListener('click', showSettings);

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        hideModals();
    }
});

// Initialize
loadChats();

// Make functions globally accessible
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
window.loadChat = loadChat;
window.deleteChat = deleteChat;
window.renameChat = renameChat;
window.deleteAllChats = deleteAllChats;
window.toggleMenu = toggleMenu;
window.showPreviousVersion = showPreviousVersion;
window.showNextVersion = showNextVersion;