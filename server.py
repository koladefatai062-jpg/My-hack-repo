from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import base64
import requests
import secrets
import time
import hashlib
import hmac
from datetime import datetime

app = Flask(__name__)
CORS(app)
os.makedirs('data', exist_ok=True)

# ============================================================
# ===== FLUTTERWAVE CONFIG (Optional) =====
# ============================================================
FLW_SECRET_KEY = "FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxx"
FLW_PUBLIC_KEY = "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================================
# ===== OPAY CONFIG =====
# ⚠️ REPLACE WITH YOUR OPAY MERCHANT CREDENTIALS ⚠️
# ============================================================
OPAY_MERCHANT_ID = "2566xxxxxxxx"          # Your OPay Merchant ID
OPAY_PUBLIC_KEY = "OPAYPUBK_xxxxxxxxxxxx"  # Your OPay Public Key
OPAY_SECRET_KEY = "OPAYSEC_xxxxxxxxxxxx"   # Your OPay Secret Key
OPAY_BASE_URL = "https://payapi.opayweb.com"  # Production URL

# ============================================================
# ===== OPAY: CREATE ORDER =====
# ============================================================
@app.route('/opay/create_order', methods=['POST'])
def create_opay_order():
    try:
        data = request.json
        amount = data.get('amount')
        email = data.get('email')
        name = data.get('name', 'Customer')
        phone = data.get('phone', '08000000000')

        if not amount or not email:
            return jsonify({'error': 'Amount and email required'}), 400

        # Generate unique reference
        reference = f"ZENITH-OPAY-{secrets.token_hex(8).upper()}"

        # Prepare payload for OPay
        payload = {
            "headMerchantId": OPAY_MERCHANT_ID,
            "merchantId": OPAY_MERCHANT_ID,
            "outOrderNo": reference,
            "amount": str(amount),
            "currency": "NGN",
            "orderExpireTime": 3600,
            "isSplit": "N",
            "sceneEnum": "CASH_API",
            "subSceneEnum": "API"
        }

        # Headers for OPay
        headers = {
            "Content-Type": "application/json",
            "clientAuthKey": OPAY_PUBLIC_KEY,
            "version": "V1.0.1",
            "bodyFormat": "JSON",
            "timestamp": str(int(time.time() * 1000))
        }

        # Make request to OPay
        url = f"{OPAY_BASE_URL}/openApi/order/checkout/createOrder"
        response = requests.post(url, json=payload, headers=headers)
        result = response.json()

        # Log the response for debugging
        print(f"[+] OPay create order response: {result}")

        if result.get('code') == '00000':
            order_no = result.get('data', {}).get('orderNo')
            checkout_url = f"https://checkout.opayweb.com/pay/{order_no}"

            # Save order reference to data folder
            order_data = {
                'type': 'opay_order',
                'outOrderNo': reference,
                'orderNo': order_no,
                'amount': amount,
                'email': email,
                'name': name,
                'phone': phone,
                'status': 'pending',
                'timestamp': datetime.now().isoformat()
            }

            with open(f"data/opay_order_{reference}.json", 'w') as f:
                json.dump(order_data, f, indent=2)

            return jsonify({
                'status': 'success',
                'order_no': order_no,
                'redirect_url': checkout_url
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('message', 'OPay order creation failed')
            }), 400

    except Exception as e:
        print(f"[-] OPay create order error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ============================================================
# ===== OPAY: VERIFY ORDER =====
# ============================================================
@app.route('/opay/verify_order', methods=['POST'])
def verify_opay_order():
    try:
        data = request.json
        order_no = data.get('orderNo')

        if not order_no:
            return jsonify({'error': 'Order number required'}), 400

        url = f"{OPAY_BASE_URL}/openApi/order/checkout/getOrder"
        headers = {
            "Content-Type": "application/json",
            "clientAuthKey": OPAY_PUBLIC_KEY,
            "version": "V1.0.1",
            "bodyFormat": "JSON",
            "timestamp": str(int(time.time() * 1000))
        }
        payload = {
            "merchantId": OPAY_MERCHANT_ID,
            "orderNo": order_no
        }

        response = requests.post(url, json=payload, headers=headers)
        result = response.json()

        print(f"[+] OPay verify order response: {result}")

        if result.get('code') == '00000':
            order_status = result.get('data', {}).get('status')
            out_order_no = result.get('data', {}).get('outOrderNo')

            if order_status == 'SUCCESS':
                # Payment successful
                payment_data = {
                    'type': 'opay_payment_verified',
                    'orderNo': order_no,
                    'outOrderNo': out_order_no,
                    'status': 'completed',
                    'data': result.get('data', {}),
                    '_server_time': datetime.now().isoformat()
                }

                with open(f"data/opay_payment_{order_no}.json", 'w') as f:
                    json.dump(payment_data, f, indent=2)

                print(f"[+] OPay payment verified: {out_order_no}")

                return jsonify({'status': 'success', 'data': result.get('data')})
            else:
                return jsonify({'status': 'pending', 'message': f'Payment status: {order_status}'})
        else:
            return jsonify({'status': 'error', 'message': result.get('message')}), 400

    except Exception as e:
        print(f"[-] OPay verify order error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ============================================================
# ===== OPAY: WEBHOOK (Receives OPay Callbacks) =====
# ============================================================
@app.route('/opay/webhook', methods=['POST'])
def opay_webhook():
    try:
        data = request.json

        # OPay sends data in a nested structure
        param_content = data.get('paramContent', {})

        # Extract details
        order_no = param_content.get('orderNo')
        out_order_no = param_content.get('outOrderNo')
        status = param_content.get('status')
        amount = param_content.get('amount')

        print(f"[+] OPay webhook received: {out_order_no} - {status}")

        if status == 'SUCCESS':
            # Update your records
            webhook_data = {
                'type': 'opay_webhook',
                'orderNo': order_no,
                'outOrderNo': out_order_no,
                'status': status,
                'amount': amount,
                'data': data,
                '_server_time': datetime.now().isoformat()
            }

            with open(f"data/opay_webhook_{out_order_no}.json", 'w') as f:
                json.dump(webhook_data, f, indent=2)

            print(f"[+] OPay webhook: Payment successful for {out_order_no}")

        # Always respond with success to acknowledge receipt
        return jsonify({"code": "00000", "message": "SUCCESSFUL"}), 200

    except Exception as e:
        print(f"[-] OPay webhook error: {e}")
        return jsonify({"code": "99999", "message": "FAILED"}), 500

# ============================================================
# ===== FLUTTERWAVE ENDPOINTS (Keep existing) =====
# ============================================================
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
            "redirect_url": "https://my-hack-repo.netlify.app/dashboard.html",
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

# ============================================================
# ===== CAPTURE =====
# ============================================================
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

# ============================================================
# ===== RUN SERVER =====
# ============================================================
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
