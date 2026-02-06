import DataLoader from './modules/data-loader.js';
import ComponentsLoader from './modules/components-loader.js';
import UIUtils from './modules/ui-utils.js';

// Получение ID продукта из URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'alneo-main'; // По умолчанию - alneo-main
}

// Инициализация страницы
async function init() {
    // Загружаем компоненты
    await ComponentsLoader.loadHeader();
    await ComponentsLoader.loadSidebar();
    await ComponentsLoader.loadFooter();
    
    const productId = getProductIdFromUrl();
    const product = await DataLoader.getProductById(productId);
    
    if (product) {
        UIUtils.populateProductPage(product);
        UIUtils.updateSidebar(product.id);
    } else {
        console.error('Продукт не найден:', productId);
        // Можно добавить обработку ошибки - показать страницу 404 или перенаправить
    }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);