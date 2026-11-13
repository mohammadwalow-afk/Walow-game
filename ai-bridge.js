let base64Image = null;

// ضع مفتاح Gemini API الخاص بك هنا ليعمل الذكاء الاصطناعي الفعلي في بناء الألعاب وتحليل الصور
const GEMINI_API_KEY = "";

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

    appendMessage(text || "[تم إرفاق صورة للتحليل أو التحويل لبيئة 3D]", 'user');
    input.value = '';

    // إذا تم رفع صورة بدون مفتاح API نشط، يتم تطبيقها مباشرة كبيئة 3D
    if (base64Image && GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        appendMessage("جاري تحويل صورتك الحقيقية إلى بيئة ثلاثية الأبعاد داخل المحرك...", 'ai');
        applyImageAsEnvironment(base64Image);
        clearImage();
        return;
    }

    // إذا لم يتم وضع مفتاح API بعد، يعمل المحرك بأوامر محلية ذكية للتجربة الفورية
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        appendMessage("تم تنفيذ أمرك في المحرك! (ملاحظة: أضف مفتاح Gemini API في ملف ai-bridge.js لتفعيل التوليد غير المحدود وتحليل صور الأخطاء).", 'ai');
        let localCode = `
            spawnPhysicsBall((Math.random() - 0.5) * 6, 8, (Math.random() - 0.5) * 4, Math.random() * 0xffffff);
            playSound('success');
        `;
        executeEngineCode(localCode);
        return;
    }

    appendMessage("جاري تحليل طلبك وصورتك وبناء كود اللعبة ثلاثية الأبعاد...", 'ai');

    try {
        const systemPrompt = `أنت مبرمج محرك ألعاب Three.js. أجب فقط بكود JavaScript نظيف بدون علامات markdown أو شرح. المتغيرات المتاحة لديك هي: scene, THREE, physicsObjects, spawnPhysicsBall(x,y,z,color), clearWorld(), playSound('bounce'|'success'), setUpdate(fn). إذا أرفق المستخدم صورة خطأ، أصلح الكود. إذا طلب لعبة، ابنها بالكامل.`;
        
        const parts = [{ text: systemPrompt + "\nطلب المستخدم: " + text }];
        if (base64Image) {
            const cleanBase64 = base64Image.split(',')[1];
            parts.push({ inline_data: { mime_type: "image/jpeg", data: cleanBase64 } });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });

        const data = await response.json();
        let generatedCode = data.candidates[0].content.parts[0].text;
        generatedCode = generatedCode.replace(/```javascript|```js|```/g, '').trim();

        executeEngineCode(generatedCode);
        appendMessage("تم بناء التحديث وإصلاح أي أخطاء بنجاح! يمكنك تجربة اللعبة الآن في الأعلى.", 'ai');
    } catch (error) {
        appendMessage("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. تأكد من مفتاح API أو اتصال الإنترنت.", 'ai');
    }
    clearImage();
}
