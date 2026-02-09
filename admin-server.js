const http = require('http');
const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'catalog-data.json');
const JWT_SECRET = process.env.JWT_SECRET || 'bimax-pro-admin-secret-key-2024';
const JWT_EXPIRES_IN = '1h';

// Users data file
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Initialize livereload server
const lrServer = livereload.createServer({
  exts: ['html', 'js', 'css', 'json'],
  delay: 100
});

// Watch the directory for changes
lrServer.watch(path.join(__dirname));

console.log('Livereload server running on port 35729');

// Helper function to send JSON response
function sendJSONResponse(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Helper function to send HTML response
function sendHTMLResponse(res, status, content) {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(content);
}

// Hash password function
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

// Verify password function
function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// Generate JWT token
function generateAccessToken(user) {
    return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Load users
function loadUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            const defaultUsers = [
                {
                    id: '1',
                    username: 'admin',
                    passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'admbimax5'),
                    role: 'admin'
                }
            ];
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
            return defaultUsers;
        }
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// Save users
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Load catalog data
function loadCatalogData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const defaultData = {
                brands: [],
                products: [],
                settings: {}
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return data;
    } catch (error) {
        console.error('Error loading catalog data:', error);
        return {
            brands: [],
            products: [],
            settings: {}
        };
    }
}

// Save catalog data
function saveCatalogData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving catalog data:', error);
        return false;
    }
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSONResponse(res, 401, { success: false, message: 'Access token required' });
        return;
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        sendJSONResponse(res, 401, { success: false, message: 'Invalid or expired token' });
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for all routes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle login (username/password to JWT)
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                const users = loadUsers();
                const user = users.find(u => u.username === username);

                if (!user || !verifyPassword(password, user.passwordHash)) {
                    sendJSONResponse(res, 401, { success: false, message: 'Invalid username or password' });
                    return;
                }

                const accessToken = generateAccessToken(user);
                sendJSONResponse(res, 200, { success: true, token: accessToken, user: { id: user.id, username: user.username, role: user.role } });
            } catch (error) {
                sendJSONResponse(res, 400, { success: false, message: 'Invalid request' });
            }
        });
        return;
    }

    // Handle get catalog data (requires authentication)
    if (req.url === '/api/catalog' && req.method === 'GET') {
        verifyToken(req, res, () => {
            const data = loadCatalogData();
            sendJSONResponse(res, 200, { success: true, data });
        });
        return;
    }

    // Handle save catalog data (requires authentication)
    if (req.url === '/api/catalog' && req.method === 'POST') {
        verifyToken(req, res, () => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const { catalogData } = JSON.parse(body);
                    const saved = saveCatalogData(catalogData);
                    if (saved) {
                        sendJSONResponse(res, 200, { success: true });
                    } else {
                        sendJSONResponse(res, 500, { success: false, message: 'Ошибка сохранения данных' });
                    }
                } catch (error) {
                    console.error('Error saving catalog:', error);
                    sendJSONResponse(res, 400, { success: false, message: 'Некорректные данные' });
                }
            });
        });
        return;
    }

    // Serve static files
    if (req.method === 'GET') {
        let filePath = '';
        if (req.url === '/') {
            filePath = path.join(__dirname, 'admin.html');
        } else {
            filePath = path.join(__dirname, req.url.substring(1));
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        }[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if(error.code == 'ENOENT'){
                    // File not found
                    sendHTMLResponse(res, 404, '<h1>404 - Not Found</h1>');
                }
                else {
                    // Server error
                    sendHTMLResponse(res, 500, '<h1>500 - Internal Server Error</h1>');
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // Handle not found
    sendHTMLResponse(res, 404, '<h1>404 - Not Found</h1>');
});

// Start server
server.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
    console.log('Catalog data file:', DATA_FILE);
    console.log('Default user: admin / admbimax5');
});
