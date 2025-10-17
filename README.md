📱 WhatsApp Multi-Session API (Baileys)

A lightweight Express.js + Baileys server that lets you manage multiple WhatsApp Web sessions, send messages, and handle logins using QR codes — all via simple REST APIs.

🚀 Features

📦 Multi-session WhatsApp management

🔐 Persistent session storage using Baileys useMultiFileAuthState

🧩 Simple REST API endpoints for session control and messaging

🖼️ QR code returned as Base64 (no terminal QR display needed)

🔁 Auto-reconnect on connection loss

🗑️ Logout endpoint to fully delete sessions

⚡ Built with modern ES Modules and Express.js

🧠 Tech Stack

Node.js

Express.js

Baileys (@whiskeysockets/baileys)

qrcode

⚙️ Installation
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/whatsapp-multi-session-api.git

# 2. Enter the project folder
cd whatsapp-multi-session-api

# 3. Install dependencies
npm install

# 4. Start the server
node server.js


The server will start at:

http://localhost:3000

📡 API Documentation
🔹 1. Start / Create Session

POST /session/:id
Starts a new WhatsApp session or resumes an existing one.

Example:

POST http://localhost:3000/session/mySession


Response:

{
  "status": true,
  "message": "Session mySession started/exists"
}

🔹 2. Get QR Code

GET /session/:id/qr
Fetch the QR code for scanning (Base64 encoded image).

Example:

GET http://localhost:3000/session/mySession/qr


Response (QR available):

{
  "status": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}


Response (Already connected):

{
  "status": true,
  "message": "Already connected",
  "qr": null
}

🔹 3. Send Message

POST /send
Send a WhatsApp text message using an active session.

Request Body:

{
  "sessionId": "mySession",
  "number": "919876543210",
  "message": "Hello from my bot!"
}


Response:

{
  "status": true,
  "message": "Message sent"
}

🔹 4. List Active Sessions

GET /sessions
Returns a list of all currently active or connected sessions.

Response:

{
  "status": true,
  "sessions": [
    {
      "sessionId": "mySession",
      "connected": true
    },
    {
      "sessionId": "testBot",
      "connected": false
    }
  ]
}

🔹 5. Logout & Delete Session

DELETE /session/:id/logout
Logs out and removes the session, deleting all credentials.

Example:

DELETE http://localhost:3000/session/mySession/logout


Response:

{
  "status": true,
  "message": "Session mySession logged out and deleted"
}

🧩 Directory Structure
📦 whatsapp-multi-session-api
 ┣ 📂 auth/              # Stores session auth data
 ┣ 📜 index.js           # Main Express + Baileys server
 ┣ 📜 package.json
 ┗ 📜 README.md

🛠️ Example Use Cases

Automate WhatsApp messaging

Build chatbots with multiple accounts

Manage WhatsApp sessions remotely

Integrate with CRMs or notification systems

⚠️ Notes

Each session corresponds to one WhatsApp number.

The session persists in ./auth/{sessionId} directory.

Do not delete the auth folder if you want sessions to stay logged in.

Logging out (DELETE /session/:id/logout) removes credentials permanently.

🧑‍💻 Author

Gourab Sardar
💼 PHP & Node.js Developer
🌐 https://apiget.in

📞 Call: 8981725584 | 💬 WhatsApp: 8981725584

🌟 GitHub Description (for your repo)

A powerful multi-session WhatsApp Web API built with Express.js and Baileys.
Easily manage multiple WhatsApp accounts, send messages, fetch QR codes, and handle logouts — all via RESTful APIs.
Perfect for automation, bots, and CRM integrations.
