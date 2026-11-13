let scene, camera, renderer, audioCtx = null;
let physicsObjects = [];
let customUpdateCallback = null;

function initEngine() {
    const container = document.getElementById('canvas-target');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 15, 60);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(12, 25, 12);
    dirLight.castShadow = true;
    scene.add(dirLight);

    buildDefaultWorld();
    window.addEventListener('resize', onWindowResize);
    animateLoop();
}

function onWindowResize() {
    const container = document.getElementById('canvas-target');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function togglePreviewMode() {
    const vp = document.getElementById('viewport-container');
    vp.classList.toggle('fullscreen');
    setTimeout(onWindowResize, 310);
}

function buildDefaultWorld() {
    clearWorld();
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    for (let i = -3; i <= 3; i++) {
        const mGeo = new THREE.ConeGeometry(4, 9, 5);
        const mMat = new THREE.MeshStandardMaterial({ color: 0x4a6b3d });
        const mountain = new THREE.Mesh(mGeo, mMat);
        mountain.position.set(i * 7, 4.5, -18);
        scene.add(mountain);
    }

    spawnPhysicsBall(0, 6, 0, 0xff4500);
}

function clearWorld() {
    physicsObjects = [];
    customUpdateCallback = null;
    while (scene.children.length > 0) {
        const obj = scene.children[0];
        if (obj.isLight) break;
        scene.remove(obj);
    }
    const lights = scene.children.filter(c => c.isLight);
    scene.children = [...lights];
}

function spawnPhysicsBall(x, y, z, colorHex) {
    const geo = new THREE.SphereGeometry(0.8, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.2, roughness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    scene.add(mesh);

    physicsObjects.push({
        mesh: mesh,
        velocity: new THREE.Vector3(0, 0, 0),
        gravity: 0.008,
        bounce: 0.72,
        radius: 0.8
    });
}

// تحويل صورة مرفوعة (جبل أو مدينة) إلى خامة ثلاثية الأبعاد وتضاريس داخل اللعبة
function applyImageAsEnvironment(imageBase64) {
    const loader = new THREE.TextureLoader();
    loader.load(imageBase64, (texture) => {
        // جعل الصورة خلفية بانورامية أو خامة على التضاريس
        scene.background = texture;
        
        const wallGeo = new THREE.BoxGeometry(16, 9, 0.5);
        const wallMat = new THREE.MeshStandardMaterial({ map: texture });
        const envWall = new THREE.Mesh(wallGeo, wallMat);
        envWall.position.set(0, 4.5, -10);
        scene.add(envWall);
        playSound('success');
    });
}

function animateLoop() {
    requestAnimationFrame(animateLoop);

    physicsObjects.forEach(obj => {
        obj.velocity.y -= obj.gravity;
        obj.mesh.position.add(obj.velocity);

        if (obj.mesh.position.y <= obj.radius) {
            obj.mesh.position.y = obj.radius;
            if (Math.abs(obj.velocity.y) > 0.03) {
                playSound('bounce');
            }
            obj.velocity.y = -obj.velocity.y * obj.bounce;
        }
    });

    if (typeof customUpdateCallback === 'function') {
        try { customUpdateCallback(); } catch (e) { console.error(e); }
    }

    renderer.render(scene, camera);
}

function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'bounce') {
            osc.frequency.setValueAtTime(280, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(520, audioCtx.currentTime);
            osc.frequency.setValueAtTime(780, audioCtx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        }
    } catch (e) {}
}

function executeEngineCode(codeString) {
    try {
        const runner = new Function(
            'scene', 'THREE', 'physicsObjects', 'spawnPhysicsBall', 'clearWorld', 'playSound', 'setUpdate',
            codeString
        );
        runner(scene, THREE, physicsObjects, spawnPhysicsBall, clearWorld, playSound, (fn) => { customUpdateCallback = fn; });
        document.getElementById('engine-hud').innerText = "تم التحديث بنجاح ✔";
    } catch (err) {
        console.error("Engine Execution Error:", err);
        document.getElementById('engine-hud').innerText = "خطأ برمجي! التقط شاشة وارفعه للإصلاح.";
    }
}

window.onload = initEngine;
