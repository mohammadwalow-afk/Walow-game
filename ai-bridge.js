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
async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text && !base64Image) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        appendMessage("⚠️ يجب إدخال مفتاح Gemini API لبدء البناء.", "ai");
        return;
    }

    if (text) appendMessage(text, "user");
    input.value = '';
    appendMessage("جاري البرمجة والبناء...", "ai");

    try {
        const parts = [{ text: "أنت محرك بناء ألعاب ثلاثية الأبعاد باستخدام Three.js. اكتب كود JavaScript فقط بدون أي شرح أو علامات ماركداون لتنفيذ الطلب التالي داخل مشهد scene موجود مسبقاً: " + text }];
        if (base64Image) {
            const base64Data = base64Image.split(',')[1];
            const mimeType = base64Image.split(';')[0].split(':')[1];
            parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
            clearImage();
        }
 {
                    const response = await fetch("https://googleapis.com" + apiKey, {

            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let code = data.candidates[0].content.parts[0].text;
        code = code.replace(/```javascript|```js|```/g, '').trim();

        new Function(code)();
        appendMessage("✅ تم تنفيذ التعديل في عالم اللعبة بنجاح!", "ai");
    } catch (error) {
        appendMessage("❌ حدث خطأ: " + error.message, "ai");
    }
}
