// Загрузка данных о продуктах
async function loadProductsData() {
    try {
        const response = await fetch('data/products-data.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные о продуктах');
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

        // Initialize hamburger menu functionality after header is loaded
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        function toggleMenu() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');

            // Close all dropdowns when opening mobile menu
            if (navLinks.classList.contains('active')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.classList.remove('active');
                });
            }
        }

        // Add click event to hamburger
        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
        }

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Remove dropdown toggle functionality for mobile menu
        // Now dropdown links will directly navigate to their href

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

// Получение ID продукта из URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'alneo'; // По умолчанию - alneo
}

// Заполнение страницы данными продукта
function populatePage(product) {
    // Устанавливаем заголовок страницы
    document.getElementById('page-title').textContent = `${product.title} - Bimax Pro`;
    
    // Устанавливаем заголовок продукта
    document.getElementById('product-title').textContent = product.title;
    
    // Устанавливаем описание продукта
    document.getElementById('product-description').textContent = product.description;
    
    // Устанавливаем изображение продукта
    const productImage = document.getElementById('product-image');
    productImage.src = product.image;
    productImage.alt = product.title;
    
    // Устанавливаем заголовок CTA
    document.getElementById('cta-title').textContent = product.ctaTitle;
    
    // Заполняем спецификации
    const specsTable = document.getElementById('specs-table');
    specsTable.innerHTML = '';
    
    product.specs.forEach(spec => {
        const specRow = document.createElement('div');
        specRow.className = 'spec-row';
        
        const specName = document.createElement('span');
        specName.className = 'spec-name';
        specName.textContent = spec.name;
        
        const specValue = document.createElement('span');
        specValue.className = 'spec-value';
        specValue.textContent = spec.value;
        
        specRow.appendChild(specName);
        specRow.appendChild(specValue);
        specsTable.appendChild(specRow);
    });
    
    // Обновляем активные ссылки в сайдбаре
    updateSidebar(product.id);
}

// Обновление активных ссылок в сайдбаре
function updateSidebar(activeProductId) {
    const links = document.querySelectorAll('.series-link');
    links.forEach(link => {
        const productId = link.getAttribute('data-product-id');
        if (productId === activeProductId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Инициализация страницы
async function init() {
    // Загружаем хедер
    await loadHeader();
    
    // Загружаем сайдбар
    await loadSidebar();
    
    // Загружаем футер
    await loadFooter();
    
    const products = await loadProductsData();
    const productId = getProductIdFromUrl();
    
    // Находим нужный продукт
    const product = products.find(p => p.id === productId);
    
    if (product) {
        populatePage(product);
    } else {
        console.error('Продукт не найден:', productId);
        // Можно добавить обработку ошибки - показать страницу 404 или перенаправить
    }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
