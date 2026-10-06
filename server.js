require('dotenv').config();

const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { Filter } = require('bad-words')
const crypto = require('crypto');

let MAINTENANCE_MODE = false;

const fs = require('fs');
const path = require('path');

const filter = new Filter();
const app = express();

// Trust the X-Forwarded-For header set by hosts like Render, so the rate
// limiter sees each visitor's real IP instead of the proxy's
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const LOG_FILE = path.join(__dirname, 'server.log');
const GUESTBOOK_FILE = path.join(__dirname, 'guestbook.json');

function getGuestbookMessages() {
    if (!fs.existsSync(GUESTBOOK_FILE)) return [];
    return JSON.parse(fs.readFileSync(GUESTBOOK_FILE, 'utf8'));
}
function validateEntry(name, msg) {
    if (typeof name !== 'string' || typeof msg !== 'string') {
        return 'Name and message must be text.';
    }
    if (name.trim().length < 1 || name.trim().length > 40) {
        return 'Name must be 1 to 40 characters.';
    }
    if (msg.trim().length < 1 || msg.trim().length > 280) {
        return 'Message must be 1 to 280 characters.';
    }
    return null;
}

let visitorCount = 0;

// Trim the log file if it's gotten too big
if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > 128 * 128) {
    const recentLines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(-10);
    fs.writeFileSync(LOG_FILE, recentLines.join('\n'));
}

// ==========================================
// MIDDLEWARE SETUP
// Each function below runs on every request, then calls next() to pass
// it along - like a checkpoint before your routes.
// ==========================================

// Parse incoming POST form data (from <form> submissions) and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logs every request to the console and to server.log
app.use((req, res, next) => {
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.path}\n`;
    console.log(logLine.trim());
    fs.appendFile(LOG_FILE, logLine, (err) => {
        if (err) console.error('Log write failed:', err);
    });
    next();
});

// Rate limiter - blocks an IP with a 429 response if it sends too many
// requests within the time window
const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 second window
    limit: 100,          // max requests per window, per IP
    message: '<h1>429 Too Many Requests</h1><p>Please wait 10 seconds.</p>'
});
app.use(limiter);

app.use((req, res, next) => {
    if (MAINTENANCE_MODE)
        return res.status(503).send('<h1>503 Service Unavailable</h1><p>The server is currently undergoing maintenance. Please try again later.</p>');
    next();
});

// Tracks logged-in users via a signed cookie - the browser sends it back
// automatically, no frontend code needed. Requires SESSION_SECRET in .env.
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 15 * 60 * 1000 } // session expires after 15 minutes
}));

// Route guard - use this on any route that should require login.
// Example: app.get('/dashboard', requireAuth, (req, res) => { ... });
function requireAuth(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.status(301).redirect('/');
        // return res.status(401).json({ error: 'Please log in first' });
    }
    next();
}

// ==========================================
// ROUTES
// Fill these in! Example routes are shown below.
// ==========================================

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

// Exposes the visitor count as JSON, e.g. for a frontend script to display
app.get('/api/stats', (req, res) => {
    res.json({ visitorCount });
});

// Checks the password against .env; marks the session authenticated if correct
app.post('/login', (req, res) => {
    console.log('Login attempt:');
    const { password, rememberMe } = req.body;
    if (password === process.env.APP_PASSWORD) {
        req.session.isAuthenticated = true;
        if (rememberMe) {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }
        return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// Logout - destroys the session so req.session.isAuthenticated is gone
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ success: true });
    });
});

// Example protected route - try visiting this without logging in first
app.get('/dashboard', requireAuth, (req, res) => {
    res.send('<h1>Dashboard</h1><p>You are logged in!</p>');
});

// Example: run code (logging, a counter, etc.) before serving a page from /public
app.get('/projects', (req, res) => {
    visitorCount++;
    console.log(`Visit #${visitorCount}: someone viewed the projects page`);
    res.sendFile(path.join(PUBLIC_DIR, 'projects.html'));
});

app.get('/api/whoami', (req, res) => {
    res.json({ loggedIn: req.session.isAuthenticated });
});

app.get('/guestbook', requireAuth, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'guestbook.html'));
});

app.get('/api/guestbook', requireAuth, (req, res) => {
    res.json(getGuestbookMessages());
});

app.post('/api/guestbook', requireAuth, (req, res) => {
    console.log('New guestbook message:');
    const { name, msg } = req.body;
    if (!msg) {
        return res.status(400).json({ error: 'Message is required' });
    }
    const messages = getGuestbookMessages();
    // Bad-words filter here if you want to filter out profanity

    const cleanedInput = msg.replace(/\s+/g, ' ').trim();
    const compactInput = cleanedInput.replace(/\s/g, '');
    if (filter.isProfane(compactInput)) {
        return res.status(400).json({ error: 'Profanity is a net negative!' });
    }
    const entry = {
        id: crypto.randomUUID(),
        name: name,
        msg: compactInput,
        createdAt: new Date().toISOString()
    };
    messages.push(entry);

    fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(messages.slice(-50), null, 2));
    res.json({ success: true });
});

// app.post('/api/guestbook', requireAuth, (req, res) => {
//     const { msg } = req.body;
//     if (!msg) {
//         return res.status(400).json({ error: 'Message is required' });
//     }
//     const messages = getGuestbookMessages();
//     messages.push(msg);
//     fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(messages.slice(-50), null, 2));
//     res.json({ success: true });
// });

app.get('/', (req, res) => {
    visitorCount++;
    console.log(`Visit #${visitorCount}: someone viewed the landing page`);
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// app.get('/your-route-here', (req, res) => {
//
// });

// app.post('/your-route-here', (req, res) => {
//
// });

// ==========================================
// STATIC FILES
// Serves everything in /public (put this AFTER your routes)
// `extensions: ['html']` lets /projects find projects.html without the extension
// ==========================================
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// 404 HANDLER - runs only if no route or static file answered
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

// ERROR HANDLER - the 4 parameters tell Express this handles errors
app.use((err, req, res, next) => {
    // Full details go to YOU, in the console and the log file
    const time = new Date().toISOString();
    console.error(`[${time}] ERROR ${req.method} ${req.path}`, err);
    fs.appendFile(LOG_FILE, `[${time}] ERROR ${req.method} ${req.path}: ${err.message}\n`, () => { });

    // If a response already started sending, let Express finish up
    if (res.headersSent) return next(err);

    // Errors with a status under 500 are the user's fault and safe to explain.
    // Anything else is our fault, so hide the details.
    const status = err.status || 500;
    const message = status < 500 ? err.message : 'Something went wrong on our end.';

    if (req.path.startsWith('/api/')) {
        return res.status(status).json({ error: message });
    }
    res.status(status).send('<h1>Something went wrong</h1><p>Please try again later.</p><a href="/">Back to home</a>');
});

app.listen(PORT, () => console.log(`Server live on http://localhost:${PORT}`));