import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { toDataURL } from 'qrcode'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(express.json())

// In-memory sessions store
const sessions = {}

/**
 * Start or return an existing WhatsApp session
 */
async function startSession(sessionId) {
    if (sessions[sessionId]?.socket) return sessions[sessionId].socket

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${sessionId}`)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    })

    sessions[sessionId] = { socket: sock, qr: null }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            sessions[sessionId].qr = await toDataURL(qr)
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            console.log(`[${sessionId}] Disconnected, code:`, statusCode)

            if (statusCode !== 401) {
                console.log(`[${sessionId}] Reconnecting...`)
                sessions[sessionId].socket = null
                await startSession(sessionId).catch(console.error)
            } else {
                console.log(`[${sessionId}] Session invalid, delete ./auth/${sessionId} to reset`)
            }
        }

        if (connection === 'open') {
            console.log(`[${sessionId}] Connected to WhatsApp`)
            sessions[sessionId].qr = null
        }
    })

    setInterval(() => {
        if (sessions[sessionId]?.socket?.ws?.readyState === 1) {
            sessions[sessionId].socket.ws.ping()
        }
    }, 20000)

    return sock
}

// ===================
// API Endpoints
// ===================

// Start session
app.post('/session/:id', async (req, res) => {
    const sessionId = req.params.id
    try {
        await startSession(sessionId)
        res.json({ status: true, message: `Session ${sessionId} started/exists` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ status: false, message: err.message })
    }
})

// Get QR code
app.get('/session/:id/qr', (req, res) => {
    const sessionId = req.params.id
    const session = sessions[sessionId]
    if (!session) return res.status(404).json({ status: false, message: 'Session not found' })
    if (!session.qr) return res.json({ status: true, message: 'Already connected', qr: null })
    res.json({ status: true, qr: session.qr })
})

// Send message
app.post('/send', async (req, res) => {
    const { sessionId, number, message } = req.body
    if (!sessionId || !number || !message)
        return res.status(400).json({ status: false, message: 'sessionId, number, message required' })

    const session = sessions[sessionId]
    if (!session) return res.status(404).json({ status: false, message: 'Session not found' })

    try {
        const jid = `${number}@s.whatsapp.net`
        await session.socket.sendMessage(jid, { text: message })
        res.json({ status: true, message: 'Message sent' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ status: false, message: err.message })
    }
})

// List active sessions
app.get('/sessions', (req, res) => {
    const activeSessions = Object.keys(sessions).map(id => ({
        sessionId: id,
        connected: sessions[id].qr === null
    }))
    res.json({ status: true, sessions: activeSessions })
})

/**
 * 🔴 Logout session (delete credentials + close socket)
 */
app.delete('/session/:id/logout', async (req, res) => {
    const sessionId = req.params.id
    const session = sessions[sessionId]

    if (!session) return res.status(404).json({ status: false, message: 'Session not found' })

    try {
        // Close the socket connection gracefully
        if (session.socket?.ws) {
            await session.socket.logout()
            session.socket.ws.close()
        }

        // Delete auth folder
        const authPath = path.join('./auth', sessionId)
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true })
        }

        // Remove from memory
        delete sessions[sessionId]

        res.json({ status: true, message: `Session ${sessionId} logged out and deleted` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ status: false, message: err.message })
    }
})

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'))
