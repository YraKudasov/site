const crypto = require('crypto');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

// Генерируем хэш для нового пароля
const newPassword = 'BimaxProAdmin2024!';
const passwordHash = hashPassword(newPassword);

console.log('Новый пароль:', newPassword);
console.log('Хэш для users.json:', passwordHash);