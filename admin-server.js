const http = require('http');
const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
require('dotenv').config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'catalog-data.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admbimax5';

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

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for all routes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle authentication check
    if (req.url === '/api/auth' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body);
                if (password === ADMIN_PASSWORD) {
                    sendJSONResponse(res, 200, { success: true });
                } else {
                    sendJSONResponse(res, 401, { success: false, message: 'Неправильный пароль' });
                }
            } catch (error) {
                sendJSONResponse(res, 400, { success: false, message: 'Некорректный запрос' });
            }
        });
        return;
    }

    // Handle get catalog data
    if (req.url === '/api/catalog' && req.method === 'GET') {
        const data = loadCatalogData();
        sendJSONResponse(res, 200, { success: true, data });
        return;
    }

    // Handle save catalog data
    if (req.url === '/api/catalog' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { catalogData, password } = JSON.parse(body);
                if (password !== ADMIN_PASSWORD) {
                    sendJSONResponse(res, 401, { success: false, message: 'Неправильный пароль' });
                    return;
                }
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
        return;
    }

    // Handle not found
    sendHTMLResponse(res, 404, '<h1>404 - Not Found</h1>');
});

// Start server
server.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
    console.log('Catalog data file:', DATA_FILE);
    console.log('Password:', ADMIN_PASSWORD);
});