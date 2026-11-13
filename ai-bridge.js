let base64Image = null;

// دالة لجلب المفتاح بأمان من التخزين المحلي
function getApiKey() {
    return localStorage.getItem('walow_gemini_key') || '';
}

// إنشاء زر إعدادات دائم وواضح في الشاشة لا يمكن اختفاؤه
window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('walow-settings-btn')) {
        const btn = document.createElement('button');
        btn.id = 'walow-settings-btn';
        btn.innerHTML = '🔑 مفتاح AI';
        btn.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 999999; background: #ffcc00; color: #000; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);';
        
        btn.onclick = () => {
            const currentKey = localStorage.getItem('walow_gemini_key') || '';
            const newKey = prompt("أدخل مفتاح Gemini API الخاص بك هنا:", currentKey);
            if (newKey !== null) {
                localStorage.setItem('walow_gemini_key', newKey.trim());
                if (newKey.trim() !== '') {
                    alert('✅ تم حفظ المفتاح بنجاح! يمكنك الآن إعطاء الأوامر للمحرك.');
                } else {
                    alert('⚠️ تم مسح المفتاح.');
                }
            }
        };
        document.body.appendChild(btn);
    }
});

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
