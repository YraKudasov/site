// Загрузка боковой панели
async function loadSidebar() {
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) {
            throw new Error('Не удалось загрузить боковую панель: ' + response.status);
        }
        
        const sidebarHtml = await response.text();
        
        // Находим все контейнеры для боковой панели
        const sidebarContainers = document.querySelectorAll('.catalog-sidebar-container');
        
        if (sidebarContainers.length === 0) {
            console.warn('Контейнеры для боковой панели не найдены');
            return;
        }
        
        sidebarContainers.forEach(container => {
            container.innerHTML = sidebarHtml;
        });
        
        console.log('Боковая панель загружена успешно');
        
        // Обновляем активные ссылки после загрузки
        updateActiveLinks();
        
    } catch (error) {
        console.error('Ошибка загрузки боковой панели:', error);
        
        // Аварийная загрузка - вставляем HTML напрямую
        const fallbackHtml = `
            <aside class="catalog-sidebar">
                <div class="sidebar-section">
                    <h3 class="sidebar-title">Профильные системы</h3>
                    <ul class="system-list">
                        <li class="system-item">
                            <a href="alneо.html" class="series-link brand-link">
                                <span class="system-name">Алнео</span>
                            </a>
                        </li>
                        <li class="system-item">
                            <a href="alt72.html" class="series-link">
                                <span class="system-name">ALT 72</span>
                            </a>
                        </li>
                        <li class="system-item">
                            <a href="al45.html" class="series-link">
                                <span class="system-name">AL 45</span>
                            </a>
                        </li>
                        <li class="system-item">
                            <a href="topline.html" class="series-link brand-link">
                                <span class="system-name">TopLine</span>
                            </a>
                            <ul class="sub-series-list">
                                <li><a href="topline.html#topline-3k">TopLine 3k</a></li>
                                <li><a href="topline-5k.html">TopLine 5k</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </aside>
        `;
        
        const sidebarContainers = document.querySelectorAll('.catalog-sidebar-container');
        sidebarContainers.forEach(container => {
            container.innerHTML = fallbackHtml;
        });
        
        updateActiveLinks();
    }
}

// Обновление активных ссылок
function updateActiveLinks() {
    // Получаем текущий URL
    const currentPath = window.location.pathname.split('/').pop();
    
    // Находим все ссылки в боковой панели
    const links = document.querySelectorAll('.catalog-sidebar .series-link');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Проверяем, соответствует ли ссылка текущей странице
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Инициализация загрузки боковой панели
document.addEventListener('DOMContentLoaded', loadSidebar);