from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_url_path='', static_folder="../")

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=9010)