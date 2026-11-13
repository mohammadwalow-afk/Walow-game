let base64Image = null;

function getApiKey() {
    let inputField = document.getElementById('api-key-input');
    if (inputField && inputField.value.trim() !== '') {
        localStorage.setItem('walow_gemini_key', inputField.value.trim());
        return inputField.value.trim();
    }
    return localStorage.getItem('walow_gemini_key') || '';
}

window.addEventListener('DOMContentLoaded', () => {
    try {
        if (!document.getElementById('api-key-container')) {
            const container = document.createElement('div');
            container.id = 'api-key-container';
            container.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 8px; display: flex; gap: 5px;';
            
            const savedKey = localStorage.getItem('walow_gemini_key') || '';
            container.innerHTML = `
                <input type="password" id="api-key-input" placeholder="API Key" value="${savedKey}" style="padding: 5px; border-radius: 4px; border: none; font-size: 12px; width: 110px;" />
                <button onclick="saveApiKeyBtn()" style="padding: 5px 8px; background: #00ffcc; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">حفظ</button>
            `;
            document.body.appendChild(container);
        }
    } catch (e) {
        console.error("UI Error:", e);
    }
});

function saveApiKeyBtn() {
    const key = getApiKey();
    if (key) {
        alert('تم حفظ المفتاح بنجاح!');
    } else {
        alert('الرجاء إدخال المفتاح أولاً.');
    }
}

function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64Image = e.target.result;
            const preview = document.getElementById('upload-preview');
            const box = document.getElementById('preview-box');
            if (preview) preview.src = base64Image;
            if (box) box.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

function clearImage() {
    base64Image = null;
    const box = document.getElementById('preview-box');
    const input = document.getElementById('image-input');
    if (box) box.style.display = 'none';
    if (input) input.value = '';
}

function appendMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${sender}`;
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
