import ComponentsLoader from './modules/components-loader.js';

// Manager data for each region
const managers = {
    volgograd: {
        name: "Алексей Сидоров",
        position: "Менеджер по продажам",
        phone: "+7 (8442) 123-456",
        email: "sidorov@bimaxpro.ru"
    },
    volzhsky: {
        name: "Мария Петрова",
        position: "Технический директор",
        phone: "+7 (8443) 654-321",
        email: "petrova@bimaxpro.ru"
    },
    kamyshin: {
        name: "Иван Иванов",
        position: "Генеральный директор",
        phone: "+7 (84457) 987-654",
        email: "ivanov@bimaxpro.ru"
    },
    mikhaylovka: {
        name: "Елена Кузнецова",
        position: "Менеджер по работе с клиентами",
        phone: "+7 (84463) 456-789",
        email: "kuznetsova@bimaxpro.ru"
    },
    uryupinsk: {
        name: "Дмитрий Смирнов",
        position: "Региональный менеджер",
        phone: "+7 (84442) 321-987",
        email: "smirnov@bimaxpro.ru"
    },
    frolovo: {
        name: "Анна Волкова",
        position: "Региональный менеджер",
        phone: "+7 (84465) 789-123",
        email: "volkova@bimaxpro.ru"
    }
};

// Function to handle region selection
function handleRegionChange() {
    const regionSelect = document.getElementById('region');
    const managerInfo = document.getElementById('manager-info');
    const managerDetails = document.getElementById('manager-details');
    
    const selectedRegion = regionSelect.value;
    
    if (selectedRegion && managers[selectedRegion]) {
        const manager = managers[selectedRegion];
        managerDetails.innerHTML = `
            <p><strong>Имя:</strong> ${manager.name}</p>
            <p><strong>Должность:</strong> ${manager.position}</p>
            <p><strong>Телефон:</strong> <a href="tel:${manager.phone}">${manager.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${manager.email}">${manager.email}</a></p>
        `;
        managerInfo.style.display = 'block';
    } else {
        managerInfo.style.display = 'none';
    }
}


// Catalog sidebar functionality - simplified for all systems view
function initCatalog() {
    const systemLinks = document.querySelectorAll('.system-link');

    // System link click handler - just toggle the series list visibility
    systemLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const systemId = this.getAttribute('data-system');
            const seriesList = document.getElementById(`${systemId}-series`);

            // Toggle active class
            systemLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Toggle series list visibility
            document.querySelectorAll('.series-list').forEach(list => {
                if (list.id === `${systemId}-series`) {
                    list.style.display = list.style.display === 'block' ? 'none' : 'block';
                } else {
                    list.style.display = 'none';
                }
            });
        });
    });

    // Initialize with first system active and series list visible
    const firstSystemLink = document.querySelector('.system-link');
    if (firstSystemLink) {
        firstSystemLink.click();
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем хедер и футер
    await ComponentsLoader.loadHeader();
    await ComponentsLoader.loadFooter();
    
    // Region selector
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', handleRegionChange);
    }

    // Catalog functionality
    if (document.querySelector('.catalog-sidebar')) {
        initCatalog();
    }

    // Ensure dropdowns are closed on mobile by default
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }
});

// Handle window resize to manage dropdown behavior
window.addEventListener('resize', function() {
    // If switching to mobile view, ensure dropdowns are closed
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }
    // If switching to desktop view, reset dropdown behavior
    else {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = '';
        });
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
    }
});