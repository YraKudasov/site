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

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
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

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Region selector
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', handleRegionChange);
    }
});
