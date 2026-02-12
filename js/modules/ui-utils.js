import DataLoader from './data-loader.js';

// Модуль для утилитарных функций работы с UI
class UIUtils {
    static async renderSidebar() {
        try {
            const brands = await DataLoader.loadBrands();
            const systemList = document.getElementById('system-list');
            if (!systemList) return;

            systemList.innerHTML = '';

            // Фильтруем только реальные бренды (не "all-systems")
            const realBrands = brands.filter(brand => brand.id !== 'all-systems');

            realBrands.forEach(brand => {
                const brandLi = document.createElement('li');
                brandLi.className = 'system-item';

                const brandLink = document.createElement('a');
                brandLink.href = `brands-catalog.html?brand=${brand.id}`;
                brandLink.className = 'series-link brand-link';
                brandLink.setAttribute('data-product-id', brand.id);
                
                const systemName = document.createElement('span');
                systemName.className = 'system-name';
                systemName.textContent = brand.name;
                brandLink.appendChild(systemName);

                brandLi.appendChild(brandLink);

                // Добавляем подсписок продуктов для бренда
                const subSeriesList = document.createElement('ul');
                subSeriesList.className = 'sub-series-list';

                DataLoader.getProductsByBrand(brand.id).then(products => {
                    products.forEach(product => {
                        const productLi = document.createElement('li');
                        const productLink = document.createElement('a');
                        productLink.href = `product-template.html?id=${product.id}`;
                        productLink.textContent = product.name;
                        productLi.appendChild(productLink);
                        subSeriesList.appendChild(productLi);
                    });
                });

                brandLi.appendChild(subSeriesList);
                systemList.appendChild(brandLi);
            });

        } catch (error) {
            console.error('Ошибка при рендеринге сайдбара:', error);
        }
    }

    static async renderHeaderDropdown() {
        try {
            const brands = await DataLoader.loadBrands();
            const dropdown = document.getElementById('systems-dropdown');
            if (!dropdown) return;

            // Фильтруем только реальные бренды (не "all-systems")
            const realBrands = brands.filter(brand => brand.id !== 'all-systems');

            realBrands.forEach(brand => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `brands-catalog.html?brand=${brand.id}`;
                link.textContent = brand.name;
                li.appendChild(link);
                dropdown.appendChild(li);
            });

        } catch (error) {
            console.error('Ошибка при рендеринге выпадающего меню:', error);
        }
    }

    static async renderWindowSystemsSection() {
        try {
            const brands = await DataLoader.loadBrands();
            const systemsGrid = document.querySelector('.window-systems .cards-grid');
            if (!systemsGrid) return;

            // Фильтруем только реальные бренды (не "all-systems")
            const realBrands = brands.filter(brand => brand.id !== 'all-systems');

            // Удаляем существующие карточки
            systemsGrid.innerHTML = '';

            realBrands.forEach(brand => {
                const systemCard = document.createElement('div');
                systemCard.className = 'system-card';
                const imageSrc = brand.image && brand.image !== '' 
                    ? brand.image.startsWith('/') ? brand.image.slice(1) : brand.image 
                    : 'images/products/Alneo_ALT_72.png';
                systemCard.innerHTML = `
                    <div class="system-image">
                        <img src="${imageSrc}" alt="${brand.name}" onerror="this.src='images/products/Alneo_ALT_72.png'">
                    </div>
                    <div class="system-info">
                        <h3>${brand.name}</h3>
                        <a href="brands-catalog.html?brand=${brand.id}" class="btn-details">Подробнее</a>
                    </div>
                `;
                systemsGrid.appendChild(systemCard);
            });

        } catch (error) {
            console.error('Ошибка при рендеринге секции оконных систем:', error);
        }
    }

    static updateSidebar(activeProductId) {
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

    static createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'system-card';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'system-image';
        const img = document.createElement('img');
        const imageSrc = product.image && product.image !== '' 
            ? product.image.startsWith('/') ? product.image.slice(1) : product.image 
            : 'images/products/Alneo_ALT_72.png';
        img.src = imageSrc;
        img.alt = product.title;
        img.onerror = function() {
            this.src = 'images/products/Alneo_ALT_72.png';
        };
        imageContainer.appendChild(img);

        const infoContainer = document.createElement('div');
        infoContainer.className = 'system-info';
        const title = document.createElement('h3');
        title.textContent = product.title;
        const description = document.createElement('p');
        description.textContent = product.description;
        const link = document.createElement('a');
        link.href = `product-template.html?id=${product.id}`;
        link.className = 'btn-details';
        link.textContent = 'Подробнее';

        infoContainer.appendChild(title);
        infoContainer.appendChild(description);
        infoContainer.appendChild(link);

        card.appendChild(imageContainer);
        card.appendChild(infoContainer);

        return card;
    }

    static displayBrandProducts(brand) {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = '';

        if (!brand.products || brand.products.length === 0) {
            productsGrid.innerHTML = '<p>У данного бренда пока нет доступных продуктов.</p>';
            return;
        }

        brand.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    static populateProductPage(product) {
        // Устанавливаем заголовок страницы
        document.getElementById('page-title').textContent = `${product.title} - Bimax Pro`;
        
        // Устанавливаем заголовок продукта
        document.getElementById('product-title').textContent = product.title;
        
        // Устанавливаем описание продукта
        document.getElementById('product-description').textContent = product.description;
        
        // Устанавливаем изображение продукта
        const productImage = document.getElementById('product-image');
        const imageSrc = product.image && product.image !== '' 
            ? product.image.startsWith('/') ? product.image.slice(1) : product.image 
            : 'images/products/Alneo_ALT_72.png';
        productImage.src = imageSrc;
        productImage.alt = product.title;
        productImage.onerror = function() {
            this.src = 'images/products/Alneo_ALT_72.png';
        };
        
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
        
        // Устанавливаем ссылки для скачивания документации и плаката
        const downloadButtons = document.querySelectorAll('.btn-download');
        if (downloadButtons.length > 0 && product.documentation) {
            const docUrl = product.documentation.startsWith('/') ? product.documentation.slice(1) : product.documentation;
            downloadButtons[0].href = docUrl;
            downloadButtons[0].style.display = 'inline-flex';
        } else {
            if (downloadButtons.length > 0) {
                downloadButtons[0].style.display = 'none';
            }
        }
        
        if (downloadButtons.length > 1 && product.poster) {
            const posterUrl = product.poster.startsWith('/') ? product.poster.slice(1) : product.poster;
            downloadButtons[1].href = posterUrl;
            downloadButtons[1].style.display = 'inline-flex';
        } else {
            if (downloadButtons.length > 1) {
                downloadButtons[1].style.display = 'none';
            }
        }
    }

    static populateBrandPage(brand) {
        // Устанавливаем заголовок страницы
        document.getElementById('page-title').textContent = `${brand.title} - Bimax Pro`;

        // Устанавливаем заголовок бренда
        document.getElementById('brand-title').textContent = brand.title;

        // Устанавливаем описание бренда
        document.getElementById('brand-description').textContent = brand.description;

        // Отображаем продукты бренда
        this.displayBrandProducts(brand);
    }
}

export default UIUtils;