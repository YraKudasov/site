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
            const systemsGrid = document.querySelector('.window-systems .systems-grid');
            if (!systemsGrid) return;

            // Фильтруем только реальные бренды (не "all-systems")
            const realBrands = brands.filter(brand => brand.id !== 'all-systems');

            // Удаляем существующие карточки (кроме placeholder)
            const existingCards = systemsGrid.querySelectorAll('.system-card');
            existingCards.forEach(card => card.remove());

            realBrands.forEach(brand => {
                const systemCard = document.createElement('div');
                systemCard.className = 'system-card';
                systemCard.innerHTML = `
                    <div class="system-image">
                        <img src="${brand.image || 'images/Alneo_ALT_72.png'}" alt="${brand.name}">
                    </div>
                    <div class="system-info">
                        <h3>${brand.name}</h3>
                        <a href="brands-catalog.html?brand=${brand.id}" class="btn-details">Подробнее</a>
                    </div>
                `;
                systemsGrid.insertBefore(systemCard, systemsGrid.querySelector('.system-card-placeholder'));
            });

            // Если больше 2 брендов, удаляем placeholder
            if (realBrands.length > 2) {
                const placeholder = systemsGrid.querySelector('.system-card-placeholder');
                if (placeholder) placeholder.remove();
            }

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