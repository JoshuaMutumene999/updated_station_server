const http = require('http');
const fs = require('fs');
const path = require('path');
const http = require('mime-types');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

let visitorCount = 0;

const messages = ["Server is running!"];

const foodList = [
    "WcPizza",
    "WcDLT",
    "Mighty Kids Meal",
    "Hula Burger",
    "Cinnamon Melts",
    "Mighty Wings",
    "Chicken WcBites",
    "Brownie Melts",
    "Wild Berry Smoothie",
    "Southern Style Chicken Sandwich",
    "Peanut W&W's WcFlurry",
    "Pie à la Mode",
    "Brownie Melts",
    "Grandma WcFlurry",
];

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const reqPath = parsedUrl.pathname;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const logLine =
        `[${new Date().toISOString()}] IP: ${clientIp} | Method: ${req.method} | Path: ${reqPath}\n`;

    fs.appendFile(path.join(__dirname, 'server.log'), logLine, (err) => {
        if (err) console.error('Log write failed:', err);
    });

    if (reqPath === '/roll') {
        console.log("/roll route accessed");
        let roll = Math.floor(Math.random() * 6) + 1;
        console.log(`Roll: ${roll}`);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end
    }

    if (reqPath === '/api/stats') {
        const stats = {
            visitorCount: visitorCount,
            uptimeSeconds: process.uptime(),
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
    }

    // Route Normalization: Map root to index.html & append .html to extensionless routes
    let normalizedPath = reqPath === '/' ? '/index.html' : reqPath;
    if (!path.extname(normalizedPath)) {
        normalizedPath += '.html';
    }

    const filePath = path.join(PUBLIC_DIR, normalizedPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mime.lookup(filePath) || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404: Page Not Found</h1>');
        }

        let finalContent = content;

        if (ext === '.html') {

            let randomFood = foodList[Math.floor(Math.random() * foodList.length)];
            console.log(randomFood);

            // Track visits to the home page
            if (normalizedPath === '/index.html') {
                visitorCount++;
                console.log(`[VISIT #${visitorCount}] Connection from: ${req.socket.remoteAddress}`);
            }

            // Server-Driven Theme Handling
            const theme = parsedUrl.searchParams.get('theme') === 'dark' ? 'dark-mode' : 'light-mode';
            const messageListHTML = messages.map(msg => `<li>${msg}</li>`).join('');
            const newMsg = parsedUrl.searchParams.get('msg');
            if (newMsg) {
                messages.push(newMsg);
                res.writeHead(302, { 'Location': '/shoutbox' });
                return res.end();
            }

            // Replace template placeholders in HTML files
            finalContent = content.toString()
                .replace('{{COUNT}}', String(visitorCount))
                .replace('{{THEME_CLASS}}', theme)
                .replace('{{FOOD}}', randomFood)
                .replace('{{MESSAGES}}', messageListHTML);
        }

        console.log(`[REQUEST] ${req.socket.remoteAddress} accessed ${normalizedPath}`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(finalContent);
    });
}).listen(PORT, () => console.log(`Server listening on port ${PORT}`));