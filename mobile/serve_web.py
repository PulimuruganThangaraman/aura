import http.server
import socketserver
import os
import sys

PORT = 8088
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "web")

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Keep logs clean
        pass

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    with ReusableTCPServer(("127.0.0.1", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving mobile Flutter web from {DIRECTORY} on http://127.0.0.1:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
