
let base64Image = null;

// دالة لجلب المفتاح مباشرة من التخزين المحلي أو من خانة الإدخال إذا وجدت
function getApiKey() {
    // 1. محاولة جلبه من الذاكرة المحلية المخزنة مسبقاً
    let key = localStorage.getItem('walow_gemini_key');
    if (key && key.trim() !== '') return key.trim();

    // 2. إذا لم يكن مخزناً، نبحث عن خانة الإدخال في الصفحة
    const inputField = document.getElementById('api-key-input');
    if (inputField && inputField.value.trim() !== '') {
        key = inputField.value.trim();
        localStorage.setItem('walow_gemini_key', key);
        return key;
    }

    return '';
}

// حقن واجهة إدخال المفتاح في الشاشة تلقائياً
window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('api-key-container')) {
        const container = document.createElement('div');
        container.id = 'api-key-container';
        container.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: rgba(0,0,0,0.85); padding: 6px 10px; border-radius: 8px; display: flex; gap: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
        
        const savedKey = localStorage.getItem('walow_gemini_key') || '';
        container.innerHTML = `
            <input type="password" id="api-key-input" placeholder="أدخل Gemini API Key" value="${savedKey}" style="padding: 5px; border-radius: 4px; border: none; font-size: 12px; width: 120px; outline: none;" />
            <button onclick="saveApiKeyBtn()" style="padding: 5px 10px; background: #00ffcc; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; color: #000;">حفظ</button>
        `;
        document.body.appendChild(container);
    }
});

function saveApiKeyBtn() {
    const inputField = document.getElementById('api-key-input');
    if (inputField && inputField.value.trim() !== '') {
        localStorage.setItem('walow_gemini_key', inputField.value.trim());
        alert('تم حفظ المفتاح بنجاح! يمكنك الآن إعطاء الأوامر للمحرك.');
    } else {
        alert('الرجاء إدخال مفتاح صحيح أولاً.');
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
