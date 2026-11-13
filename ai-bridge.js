let base64Image = null;

// دالة جلب المفتاح مباشرة من واجهة التطبيق أو التخزين المحلي
function getApiKey() {
    let inputField = document.getElementById('api-key-input');
    if (inputField && inputField.value.trim() !== '') {
        localStorage.setItem('walow_gemini_key', inputField.value.trim());
        return inputField.value.trim();
    }
    return localStorage.getItem('walow_gemini_key') || '';
}

// حقن واجهة إدخال المفتاح في الشاشة تلقائياً إذا لم تكن موجودة
window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('api-key-container')) {
        const container = document.createElement('div');
        container.id = 'api-key-container';
        container.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 8px; display: flex; gap: 5px;';
        
        const savedKey = localStorage.getItem('walow_gemini_key') || '';
        container.innerHTML = `
            <input type="password" id="api-key-input" placeholder="أدخل Gemini API Key" value="${savedKey}" style="padding: 5px; border-radius: 4px; border: none; font-size: 12px; width: 130px;" />
            <button onclick="saveApiKeyBtn()" style="padding: 5px 8px; background: #00ffcc; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">حفظ</button>
        `;
        document.body.appendChild(container);
    }
});

function saveApiKeyBtn() {
    const key = getApiKey();
    if (key) {
        alert('تم حفظ المفتاح بنجاح على هاتفك!');
    } else {
        alert('الرجاء إدخال مفتاح صحيح.');
    }
}

function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64Image = e.target.result;
            document.getElementById('upload-preview').src = base64Image;
            document.getElementById('preview-box').style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

function clearImage() {
    base64Image = null;
    document.getElementById('preview-box').style.display = 'none';
    document.getElementById('image-input').value = '';
}

function appendMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
