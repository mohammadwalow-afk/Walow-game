let base64Image = null;

// دالة جلب أو حفظ المفتاح محلياً بأمان تام على هاتفك فقط
function getApiKey() {
    let key = localStorage.getItem('walow_gemini_key');
    if (!key) {
        key = prompt("أدخل مفتاح Gemini API الخاص بك (سيتم حفظه بأمان على هاتفك فقط):");
        if (key) {
            localStorage.setItem('walow_gemini_key', key.trim());
        }
    }
    return key || "";
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
