// Модуль для загрузки и управления данными каталога
class DataLoader {
    // Кэш для загруженных данных
    static cache = null;

    static async loadCatalogData() {
        // Возвращаем данные из кэша, если они уже загружены
        if (this.cache) {
            return this.cache;
        }

        try {
            const response = await fetch('data/catalog-data.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить данные каталога');
            }
            this.cache = await response.json();
            return this.cache;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return { brands: [], products: [] };
        }
    }

    static async loadProducts() {
        const catalogData = await this.loadCatalogData();
        return (catalogData.products || []).filter(product => product.isActive !== false);
    }

    static async loadBrands() {
        const catalogData = await this.loadCatalogData();
        return (catalogData.brands || []).filter(brand => brand.isActive !== false);
    }

    static async getProductById(productId) {
        const catalogData = await this.loadCatalogData();
        return (catalogData.products || []).find(product => product.id === productId);
    }

    static async getBrandById(brandId) {
        const catalogData = await this.loadCatalogData();
        return (catalogData.brands || []).find(brand => brand.id === brandId);
    }

    static async getProductsByBrand(brandId) {
        const catalogData = await this.loadCatalogData();
        const allProducts = catalogData.products || [];
        
        if (brandId === 'all-systems') {
            return allProducts.filter(product => product.isActive !== false);
        }
        
        // Проверяем, активен ли бренд
        const brand = catalogData.brands.find(b => b.id === brandId);
        if (brand && brand.isActive === false) {
            return [];
        }
        
        return allProducts.filter(product => 
            product.brandId === brandId && product.isActive !== false
        );
    }

    static async getBrandWithProducts(brandId) {
        console.log('getBrandWithProducts called with brandId:', brandId);
        
        const brand = await this.getBrandById(brandId);
        console.log('Found brand:', brand);
        
        if (!brand) return null;

        const products = await this.getProductsByBrand(brandId);
        console.log('Products for brand:', products);
        
        // Фильтрация основного продукта Алнео из списка для бренда "alneo"
        const filteredProducts = brandId === 'alneo' 
            ? products.filter(product => product.id !== 'alneo-main') 
            : products;
        console.log('Filtered products:', filteredProducts);
        
        return {
            ...brand,
            products: filteredProducts.map(product => ({
                id: product.id,
                name: product.name,
                title: product.title,
                description: product.description,
                image: product.image,
                link: `product-template.html?id=${product.id}`
            }))
        };
    }
}

export default DataLoader;