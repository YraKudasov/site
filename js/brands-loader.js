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

        // Add dropdown toggle functionality for mobile menu
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                // Only handle clicks in mobile menu
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();

                    const dropdownMenu = this.nextElementSibling;
                    const isActive = this.classList.contains('active');

                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.style.display = 'none';
                        }
                    });

                    document.querySelectorAll('.dropdown-toggle').forEach(otherToggle => {
                        if (otherToggle !== this) {
                            otherToggle.classList.remove('active');
                        }
                    });

                    // Toggle current dropdown
                    if (isActive) {
                        dropdownMenu.style.display = 'none';
                        this.classList.remove('active');
                    } else {
                        dropdownMenu.style.display = 'block';
                        this.classList.add('active');
                    }
                }
            });
        });

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