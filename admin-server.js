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

// Helper function to get files from directory
function getFilesFromDirectory(dirPath, validExtensions) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            return [];
        }
        const files = fs.readdirSync(dirPath);
        const relativePath = dirPath.replace(path.join(__dirname, 'images', 'brands'), '/images/brands')
                                    .replace(path.join(__dirname, 'images', 'products'), '/images/products')
                                    .replace(path.join(__dirname, 'documents'), '/documents')
                                    .replace(path.join(__dirname, 'posters'), '/posters');
        return files.filter(file => 
            validExtensions.includes(path.extname(file).toLowerCase())
        ).map(file => `${relativePath}/${file}`);
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

// Helper function to get image files from directory
function getImagesFromDirectory(dirPath) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    return getFilesFromDirectory(dirPath, imageExtensions);
}

// Helper function to get PDF files from directory
function getPDFFilesFromDirectory(dirPath) {
    const pdfExtensions = ['.pdf'];
    return getFilesFromDirectory(dirPath, pdfExtensions);
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for all routes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Get brand images list (requires authentication)
    if (req.url === '/api/brand-images' && req.method === 'GET') {
        verifyToken(req, res, () => {
            const images = getImagesFromDirectory(path.join(__dirname, 'images', 'brands'));
            sendJSONResponse(res, 200, { success: true, images });
        });
        return;
    }

    // Get product images list (requires authentication)
    if (req.url === '/api/product-images' && req.method === 'GET') {
        verifyToken(req, res, () => {
            const images = getImagesFromDirectory(path.join(__dirname, 'images', 'products'));
            sendJSONResponse(res, 200, { success: true, images });
        });
        return;
    }

    // Upload brand image (requires authentication)
    if (req.url === '/api/upload-brand-image' && req.method === 'POST') {
        verifyToken(req, res, () => {
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });
            req.on('end', () => {
                try {
                    // Parse multipart form data
                    const contentType = req.headers['content-type'];
                    const boundary = contentType.split('boundary=')[1];
                    const bodyBuffer = Buffer.concat(body);
                    
                    // Find start and end of file data
                    const boundaryStart = Buffer.from(`--${boundary}`);
                    const boundaryEnd = Buffer.from(`--${boundary}--`);
                    
                    let fileStart = -1;
                    let fileEnd = -1;
                    let fileName = '';
                    
                    // Find file start and filename
                    const bodyStr = bodyBuffer.toString('utf8');
                    const filenameMatch = bodyStr.match(/filename="([^"]+)"/);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                        const contentDispositionEnd = bodyStr.indexOf('\r\n\r\n');
                        if (contentDispositionEnd !== -1) {
                            fileStart = contentDispositionEnd + 4;
                            fileEnd = bodyBuffer.length - boundaryEnd.length - 2; // Subtract boundary and closing --
                        }
                    }
                    
                    if (!fileName || fileStart === -1) {
                        sendJSONResponse(res, 400, { success: false, message: 'No file data' });
                        return;
                    }
                    
                    // Validate file extension
                    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
                    const fileExt = path.extname(fileName).toLowerCase();
                    if (!validExtensions.includes(fileExt)) {
                        sendJSONResponse(res, 400, { success: false, message: 'Invalid file type' });
                        return;
                    }
                    
                    // Generate unique filename
                    const timestamp = Date.now();
                    const uniqueFileName = `${timestamp}${fileExt}`;
                    const savePath = path.join(__dirname, 'images', 'brands', uniqueFileName);
                    
                    // Extract and save file data
                    const fileData = bodyBuffer.slice(fileStart, fileEnd);
                    fs.writeFileSync(savePath, fileData);
                    
                    sendJSONResponse(res, 200, { 
                        success: true, 
                        imageUrl: `/images/brands/${uniqueFileName}` 
                    });
                } catch (error) {
                    console.error('Error uploading brand image:', error);
                    sendJSONResponse(res, 500, { success: false, message: 'Error uploading image' });
                }
            });
        });
        return;
    }

    // Upload product image (requires authentication)
    if (req.url === '/api/upload-product-image' && req.method === 'POST') {
        verifyToken(req, res, () => {
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });
            req.on('end', () => {
                try {
                    // Parse multipart form data
                    const contentType = req.headers['content-type'];
                    const boundary = contentType.split('boundary=')[1];
                    const bodyBuffer = Buffer.concat(body);
                    
                    // Find start and end of file data
                    const boundaryStart = Buffer.from(`--${boundary}`);
                    const boundaryEnd = Buffer.from(`--${boundary}--`);
                    
                    let fileStart = -1;
                    let fileEnd = -1;
                    let fileName = '';
                    
                    // Find file start and filename
                    const bodyStr = bodyBuffer.toString('utf8');
                    const filenameMatch = bodyStr.match(/filename="([^"]+)"/);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                        const contentDispositionEnd = bodyStr.indexOf('\r\n\r\n');
                        if (contentDispositionEnd !== -1) {
                            fileStart = contentDispositionEnd + 4;
                            fileEnd = bodyBuffer.length - boundaryEnd.length - 2; // Subtract boundary and closing --
                        }
                    }
                    
                    if (!fileName || fileStart === -1) {
                        sendJSONResponse(res, 400, { success: false, message: 'No file data' });
                        return;
                    }
                    
                    // Validate file extension
                    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
                    const fileExt = path.extname(fileName).toLowerCase();
                    if (!validExtensions.includes(fileExt)) {
                        sendJSONResponse(res, 400, { success: false, message: 'Invalid file type' });
                        return;
                    }
                    
                    // Generate unique filename
                    const timestamp = Date.now();
                    const uniqueFileName = `${timestamp}${fileExt}`;
                    const savePath = path.join(__dirname, 'images', 'products', uniqueFileName);
                    
                    // Extract and save file data
                    const fileData = bodyBuffer.slice(fileStart, fileEnd);
                    fs.writeFileSync(savePath, fileData);
                    
                    sendJSONResponse(res, 200, { 
                        success: true, 
                        imageUrl: `/images/products/${uniqueFileName}` 
                    });
                } catch (error) {
                    console.error('Error uploading product image:', error);
                    sendJSONResponse(res, 500, { success: false, message: 'Error uploading image' });
                }
            });
        });
        return;
    }

    // Delete brand image (requires authentication)
    if (req.url.startsWith('/api/delete-brand-image') && req.method === 'DELETE') {
        verifyToken(req, res, () => {
            try {
                const urlParams = new URLSearchParams(req.url.split('?')[1]);
                const imageUrl = urlParams.get('image');
                
                if (!imageUrl) {
                    sendJSONResponse(res, 400, { success: false, message: 'Image URL is required' });
                    return;
                }
                
                // Validate image URL (only allow images from brands directory)
                if (!imageUrl.startsWith('/images/brands/')) {
                    sendJSONResponse(res, 400, { success: false, message: 'Invalid image URL' });
                    return;
                }
                
                const fileName = path.basename(imageUrl);
                const imagePath = path.join(__dirname, 'images', 'brands', fileName);
                
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    sendJSONResponse(res, 200, { success: true, message: 'Image deleted successfully' });
                } else {
                    sendJSONResponse(res, 404, { success: false, message: 'Image not found' });
                }
            } catch (error) {
                console.error('Error deleting brand image:', error);
                sendJSONResponse(res, 500, { success: false, message: 'Error deleting image' });
            }
        });
        return;
    }

    // Delete product image (requires authentication)
    if (req.url.startsWith('/api/delete-product-image') && req.method === 'DELETE') {
        verifyToken(req, res, () => {
            try {
                const urlParams = new URLSearchParams(req.url.split('?')[1]);
                const imageUrl = urlParams.get('image');
                
                if (!imageUrl) {
                    sendJSONResponse(res, 400, { success: false, message: 'Image URL is required' });
                    return;
                }
                
                // Validate image URL (only allow images from products directory)
                if (!imageUrl.startsWith('/images/products/')) {
                    sendJSONResponse(res, 400, { success: false, message: 'Invalid image URL' });
                    return;
                }
                
                const fileName = path.basename(imageUrl);
                const imagePath = path.join(__dirname, 'images', 'products', fileName);
                
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    sendJSONResponse(res, 200, { success: true, message: 'Image deleted successfully' });
                } else {
                    sendJSONResponse(res, 404, { success: false, message: 'Image not found' });
                }
            } catch (error) {
                console.error('Error deleting product image:', error);
                sendJSONResponse(res, 500, { success: false, message: 'Error deleting image' });
            }
        });
        return;
    }

    // Get documents list (requires authentication)
    if (req.url === '/api/documents' && req.method === 'GET') {
        verifyToken(req, res, () => {
            const documents = getPDFFilesFromDirectory(path.join(__dirname, 'documents'));
            sendJSONResponse(res, 200, { success: true, documents });
        });
        return;
    }

    // Get posters list (requires authentication)
    if (req.url === '/api/posters' && req.method === 'GET') {
        verifyToken(req, res, () => {
            const posters = getPDFFilesFromDirectory(path.join(__dirname, 'posters'));
            sendJSONResponse(res, 200, { success: true, posters });
        });
        return;
    }

    // Upload document (requires authentication)
    if (req.url === '/api/upload-document' && req.method === 'POST') {
        verifyToken(req, res, () => {
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });
            req.on('end', () => {
                try {
                    // Parse multipart form data
                    const contentType = req.headers['content-type'];
                    const boundary = contentType.split('boundary=')[1];
                    const bodyBuffer = Buffer.concat(body);
                    
                    // Find start and end of file data
                    const boundaryStart = Buffer.from(`--${boundary}`);
                    const boundaryEnd = Buffer.from(`--${boundary}--`);
                    
                    let fileStart = -1;
                    let fileEnd = -1;
                    let fileName = '';
                    
                    // Find file start and filename
                    const bodyStr = bodyBuffer.toString('utf8');
                    const filenameMatch = bodyStr.match(/filename="([^"]+)"/);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                        const contentDispositionEnd = bodyStr.indexOf('\r\n\r\n');
                        if (contentDispositionEnd !== -1) {
                            fileStart = contentDispositionEnd + 4;
                            fileEnd = bodyBuffer.length - boundaryEnd.length - 2; // Subtract boundary and closing --
                        }
                    }
                    
                    if (!fileName || fileStart === -1) {
                        sendJSONResponse(res, 400, { success: false, message: 'No file data' });
                        return;
                    }
                    
                    // Validate file extension
                    const validExtensions = ['.pdf'];
                    const fileExt = path.extname(fileName).toLowerCase();
                    if (!validExtensions.includes(fileExt)) {
                        sendJSONResponse(res, 400, { success: false, message: 'Invalid file type. Only PDF files are allowed.' });
                        return;
                    }
                    
                    // Preserve original filename (with safety checks for collisions)
                    let originalFileName = path.basename(fileName, fileExt);
                    let uniqueFileName = fileName;
                    let counter = 1;
                    while (fs.existsSync(path.join(__dirname, 'documents', uniqueFileName))) {
                        uniqueFileName = `${originalFileName}_${counter}${fileExt}`;
                        counter++;
                    }
                    
                    const savePath = path.join(__dirname, 'documents', uniqueFileName);
                    
                    // Extract and save file data
                    const fileData = bodyBuffer.slice(fileStart, fileEnd);
                    fs.writeFileSync(savePath, fileData);
                    
                    sendJSONResponse(res, 200, { 
                        success: true, 
                        documentUrl: `/documents/${uniqueFileName}` 
                    });
                } catch (error) {
                    console.error('Error uploading document:', error);
                    sendJSONResponse(res, 500, { success: false, message: 'Error uploading document' });
                }
            });
        });
        return;
    }

    // Upload poster (requires authentication)
    if (req.url === '/api/upload-poster' && req.method === 'POST') {
        verifyToken(req, res, () => {
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            });
            req.on('end', () => {
                try {
                    // Parse multipart form data
                    const contentType = req.headers['content-type'];
                    const boundary = contentType.split('boundary=')[1];
                    const bodyBuffer = Buffer.concat(body);
                    
                    // Find start and end of file data
                    const boundaryStart = Buffer.from(`--${boundary}`);
                    const boundaryEnd = Buffer.from(`--${boundary}--`);
                    
                    let fileStart = -1;
                    let fileEnd = -1;
                    let fileName = '';
                    
                    // Find file start and filename
                    const bodyStr = bodyBuffer.toString('utf8');
                    const filenameMatch = bodyStr.match(/filename="([^"]+)"/);
                    if (filenameMatch) {
                        fileName = filenameMatch[1];
                        const contentDispositionEnd = bodyStr.indexOf('\r\n\r\n');
                        if (contentDispositionEnd !== -1) {
                            fileStart = contentDispositionEnd + 4;
                            fileEnd = bodyBuffer.length - boundaryEnd.length - 2; // Subtract boundary and closing --
                        }
                    }
                    
                    if (!fileName || fileStart === -1) {
                        sendJSONResponse(res, 400, { success: false, message: 'No file data' });
                        return;
                    }
                    
                    // Validate file extension
                    const validExtensions = ['.pdf'];
                    const fileExt = path.extname(fileName).toLowerCase();
                    if (!validExtensions.includes(fileExt)) {
                        sendJSONResponse(res, 400, { success: false, message: 'Invalid file type. Only PDF files are allowed.' });
                        return;
                    }
                    
                    // Preserve original filename (with safety checks for collisions)
                    let originalFileName = path.basename(fileName, fileExt);
                    let uniqueFileName = fileName;
                    let counter = 1;
                    while (fs.existsSync(path.join(__dirname, 'posters', uniqueFileName))) {
                        uniqueFileName = `${originalFileName}_${counter}${fileExt}`;
                        counter++;
                    }
                    
                    const savePath = path.join(__dirname, 'posters', uniqueFileName);
                    
                    // Extract and save file data
                    const fileData = bodyBuffer.slice(fileStart, fileEnd);
                    fs.writeFileSync(savePath, fileData);
                    
                    sendJSONResponse(res, 200, { 
                        success: true, 
                        posterUrl: `/posters/${uniqueFileName}` 
                    });
                } catch (error) {
                    console.error('Error uploading poster:', error);
                    sendJSONResponse(res, 500, { success: false, message: 'Error uploading poster' });
                }
            });
        });
        return;
    }

    // Delete document (requires authentication)
    if (req.url.startsWith('/api/delete-document') && req.method === 'DELETE') {
        verifyToken(req, res, () => {
            try {
                const urlParams = new URLSearchParams(req.url.split('?')[1]);
                const documentUrl = urlParams.get('document');
                
                if (!documentUrl) {
                    sendJSONResponse(res, 400, { success: false, message: 'Document URL is required' });
                    return;
                }
                
                // Validate document URL (only allow documents from documents directory)
                if (!documentUrl.startsWith('/documents/')) {
                    sendJSONResponse(res, 400, { success: false, message: 'Invalid document URL' });
                    return;
                }
                
                const fileName = path.basename(documentUrl);
                const documentPath = path.join(__dirname, 'documents', fileName);
                
                if (fs.existsSync(documentPath)) {
                    fs.unlinkSync(documentPath);
                    sendJSONResponse(res, 200, { success: true, message: 'Document deleted successfully' });
                } else {
                    sendJSONResponse(res, 404, { success: false, message: 'Document not found' });
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                sendJSONResponse(res, 500, { success: false, message: 'Error deleting document' });
            }
        });
        return;
    }

    // Delete poster (requires authentication)
    if (req.url.startsWith('/api/delete-poster') && req.method === 'DELETE') {
        verifyToken(req, res, () => {
            try {
                const urlParams = new URLSearchParams(req.url.split('?')[1]);
                const posterUrl = urlParams.get('poster');
                
                if (!posterUrl) {
                    sendJSONResponse(res, 400, { success: false, message: 'Poster URL is required' });
                    return;
                }
                
                // Validate poster URL (only allow posters from posters directory)
                if (!posterUrl.startsWith('/posters/')) {
                    sendJSONResponse(res, 400, { success: false, message: 'Invalid poster URL' });
                    return;
                }
                
                const fileName = path.basename(posterUrl);
                const posterPath = path.join(__dirname, 'posters', fileName);
                
                if (fs.existsSync(posterPath)) {
                    fs.unlinkSync(posterPath);
                    sendJSONResponse(res, 200, { success: true, message: 'Poster deleted successfully' });
                } else {
                    sendJSONResponse(res, 404, { success: false, message: 'Poster not found' });
                }
            } catch (error) {
                console.error('Error deleting poster:', error);
                sendJSONResponse(res, 500, { success: false, message: 'Error deleting poster' });
            }
        });
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
