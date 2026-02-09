const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function changePassword(username, newPassword) {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            console.error(`Пользователь с именем ${username} не найден`);
            return false;
        }
        
        users[userIndex].passwordHash = hashPassword(newPassword);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        
        console.log(`Пароль для пользователя ${username} успешно изменен`);
        return true;
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        return false;
    }
}

// Пример использования
if (process.argv.length < 4) {
    console.log('Usage: node change-password.js <username> <newpassword>');
    console.log('Example: node change-password.js admin MyNewPassword123!');
    process.exit(1);
}

const username = process.argv[2];
const newPassword = process.argv[3];

changePassword(username, newPassword);