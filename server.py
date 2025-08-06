#!/usr/bin/env python3
"""
Simple HTTP server for the Ultimate PPL Tracker app.
Run this script to serve the app locally and avoid CORS issues.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🏋️ Ultimate PPL Tracker Server")
        print(f"📍 Serving at: http://localhost:{PORT}")
        print(f"📱 Open the above URL in your browser")
        print(f"🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Automatically open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()