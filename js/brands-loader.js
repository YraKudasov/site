import DataLoader from './modules/data-loader.js';
import ComponentsLoader from './modules/components-loader.js';
import UIUtils from './modules/ui-utils.js';

// Инициализация страницы
async function init() {
    // Загружаем компоненты
    await ComponentsLoader.loadHeader();
    await ComponentsLoader.loadSidebar();
    await ComponentsLoader.loadFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const brandId = urlParams.get('brand') || 'all-systems';

    console.log('Получаем бренд с ID:', brandId);
    const brand = await DataLoader.getBrandWithProducts(brandId);
    console.log('Получен бренд:', brand);

    if (brand) {
        UIUtils.populateBrandPage(brand);
    } else {
        console.error('Бренд не найден:', brandId);
        // Можно добавить обработку ошибки - показать страницу 404 или перенаправить
    }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
