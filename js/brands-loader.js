// Загрузка данных о брендах
async function loadBrandsData() {
    try {
        const response = await fetch('data/brands-data.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные о брендах');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return [];
    }
}

// Загрузка хедера
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить хедер');
        }
        const headerHtml = await response.text();
        const headerContainer = document.querySelector('.header-container');
        if (headerContainer) {
            headerContainer.innerHTML = headerHtml;
        }
    } catch (error) {
        console.error('Ошибка загрузки хедера:', error);
    }
}

// Загрузка футера
async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить футер');
        }
        const footerHtml = await response.text();
        const footerContainer = document.querySelector('.footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = footerHtml;
        }
    } catch (error) {
        console.error('Ошибка загрузки футера:', error);
    }
}

// Загрузка сайдбара
async function loadSidebar() {
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить сайдбар');
        }
        const sidebarHtml = await response.text();
        const sidebarContainer = document.querySelector('.catalog-sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHtml;
        }
    } catch (error) {
        console.error('Ошибка загрузки сайдбара:', error);
    }
}

// Отображение продуктов бренда
function displayBrandProducts(brand) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    brand.products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Создание карточки продукта
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'series-item compact';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'series-image';
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    imageContainer.appendChild(img);

    const infoContainer = document.createElement('div');
    infoContainer.className = 'series-info';
    const title = document.createElement('h3');
    title.textContent = product.title;
    const description = document.createElement('p');
    description.textContent = product.description;
    const link = document.createElement('a');
    link.href = product.link;
    link.className = 'btn-details';
    link.textContent = 'Подробнее';

    infoContainer.appendChild(title);
    infoContainer.appendChild(description);
    infoContainer.appendChild(link);

    card.appendChild(imageContainer);
    card.appendChild(infoContainer);

    return card;
}

// Заполнение страницы данными бренда
function populatePage(brand) {
    // Устанавливаем заголовок страницы
    document.getElementById('page-title').textContent = `${brand.title} - Bimax Pro`;

    // Устанавливаем заголовок бренда
    document.getElementById('brand-title').textContent = brand.title;

    // Устанавливаем описание бренда
    document.getElementById('brand-description').textContent = brand.description;

    // Отображаем продукты бренда
    displayBrandProducts(brand);
}

// Инициализация страницы
async function init() {
    // Загружаем хедер
    await loadHeader();

    // Загружаем сайдбар
    await loadSidebar();

    // Загружаем футер
    await loadFooter();

    const brands = await loadBrandsData();
    const urlParams = new URLSearchParams(window.location.search);
    const brandId = urlParams.get('brand') || 'all-systems';

    // Находим нужный бренд
    const brand = brands.find(b => b.id === brandId);

    if (brand) {
        populatePage(brand);
    } else {
        console.error('Бренд не найден:', brandId);
        // Можно добавить обработку ошибки - показать страницу 404 или перенаправить
    }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);