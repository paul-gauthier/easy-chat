import json
import requests
import os
import requests
from flask import Flask, request, make_response, Response
from werkzeug.datastructures import Headers

from google.cloud import secretmanager
secret_project_id = os.environ['SECRET_PROJECT_ID']
secret_name = os.environ['SECRET_NAME']
secret_version = os.environ.get('SECRET_VERSION', 'latest')

def get_bearer_token():
    client = secretmanager.SecretManagerServiceClient()
    secret_version_path = client.secret_version_path(secret_project_id, secret_name, secret_version)
    response = client.access_secret_version(request=secretmanager.AccessSecretVersionRequest(name=secret_version_path))

    return response.payload.data.decode('UTF-8')

app = Flask(__name__)

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_function(path):
    if request.method == 'OPTIONS':
        return handle_cors_preflight_request()

    host = 'api.openai.com'
    base_url = 'https://' + host
    target_url = f'{base_url}/{path}'

    headers = dict(request.headers)
    headers['Authorization'] = f"Bearer {get_bearer_token()}"
    headers['Host'] = host

    try:
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            data=request.get_data()
        )

        headers = {key: value for key, value in response.headers.items()}
        headers.pop('Transfer-Encoding', None)
        headers.pop('Content-Encoding', None)

        return Response(response.content, response.status_code, headers)

    except requests.exceptions.RequestException as e:
        return make_response(json.dumps({'error': str(e)}), 500)

def handle_cors_preflight_request():
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Host'
    }
    return Response('', 204, headers)

def lambda_handler(event, context):
    return app(event, context)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), threaded=True)
