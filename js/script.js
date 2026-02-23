import ComponentsLoader from './modules/components-loader.js';
import UIUtils from './modules/ui-utils.js';

// Load sales specialists data
let salesSpecialists = [];

async function loadSalesSpecialists() {
    try {
        const response = await fetch('data/sales-specialists.json');
        salesSpecialists = await response.json();
        renderSpecialists(salesSpecialists);
        populateCities();
    } catch (error) {
        console.error('Error loading sales specialists data:', error);
    }
}

// Function to populate cities dropdown based on selected oblast
function populateCities() {
    const oblastSelect = document.getElementById('oblast');
    const citySelect = document.getElementById('city');
    const selectedOblast = oblastSelect.value;
    
    // Clear cities dropdown except first option
    citySelect.innerHTML = '<option value="">-- Все города --</option>';
    
    if (!selectedOblast) {
        populateDistricts();
        return;
    }
    
    // Get unique cities for selected oblast
    const cities = new Set();
    salesSpecialists.forEach(specialist => {
        specialist.regions.forEach(region => {
            if (region.oblast === selectedOblast && region.city) {
                cities.add(region.city);
            }
        });
    });
    
    // Add cities to dropdown
    Array.from(cities).sort().forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    populateDistricts();
}

// Function to populate districts dropdown based on selected oblast and city
function populateDistricts() {
    const oblastSelect = document.getElementById('oblast');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const selectedOblast = oblastSelect.value;
    const selectedCity = citySelect.value;
    
    // Clear districts dropdown except first option
    districtSelect.innerHTML = '<option value="">-- Все районы --</option>';
    
    if (!selectedOblast) {
        return;
    }
    
    // Get unique districts for selected oblast and city
    const districts = new Set();
    salesSpecialists.forEach(specialist => {
        specialist.regions.forEach(region => {
            if (region.oblast === selectedOblast && 
                (!selectedCity || region.city === selectedCity)) {
                region.districts.forEach(district => {
                    if (district) {
                        districts.add(district);
                    }
                });
            }
        });
    });
    
    // Add districts to dropdown
    Array.from(districts).sort().forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
}

// Function to filter specialists based on selected filters
function filterSpecialists() {
    const oblastSelect = document.getElementById('oblast');
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    
    const selectedOblast = oblastSelect.value;
    const selectedCity = citySelect.value;
    const selectedDistrict = districtSelect.value;
    
    const filtered = salesSpecialists.filter(specialist => {
        return specialist.regions.some(region => {
            const matchesOblast = !selectedOblast || region.oblast === selectedOblast;
            const matchesCity = !selectedCity || region.city === selectedCity;
            const matchesDistrict = !selectedDistrict || region.districts.includes(selectedDistrict);
            
            return matchesOblast && matchesCity && matchesDistrict;
        });
    });
    
    renderSpecialists(filtered);
}

// Function to render sales specialists
function renderSpecialists(specialists) {
    const specialistsList = document.getElementById('specialists-list');
    
    if (specialists.length === 0) {
        specialistsList.innerHTML = '<p>Нет менеджеров по продажам для выбранного региона.</p>';
        return;
    }
    
    // Remove duplicates (same specialist can appear in multiple regions)
    const uniqueSpecialists = [];
    const seenNames = new Set();
    specialists.forEach(specialist => {
        if (!seenNames.has(specialist.name)) {
            seenNames.add(specialist.name);
            uniqueSpecialists.push(specialist);
        }
    });
    
    specialistsList.innerHTML = uniqueSpecialists.map(specialist => `
        <div class="specialist-card">
            <div class="specialist-photo">
                <img src="${specialist.photo}" alt="${specialist.name}" onerror="this.src='images/employees/default.jpg'; this.onerror=null;">
            </div>
            <h4>${specialist.name}</h4>
            <p><strong>Должность:</strong> ${specialist.position}</p>
            <p><strong>Телефон:</strong> <a href="tel:${specialist.phone}">${specialist.phone}</a></p>
            <div class="regions">
                <strong>Регионы ответственности:</strong>
                ${specialist.regions.map(region => {
                    const oblast = region.oblast;
                    const city = region.city;
                    const districts = region.districts.filter(d => d).join(', ');
                    
                    let regionText = '';
                    if (city) {
                        regionText = `${oblast}, ${city}`;
                        if (districts) {
                            regionText += ` (${districts})`;
                        }
                    } else if (districts) {
                        regionText = `${oblast}, ${districts}`;
                    } else {
                        regionText = oblast;
                    }
                    
                    return `<div class="region-item">${regionText}</div>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

// Function to handle filter changes
function handleFilterChange() {
    if (event.target.id === 'oblast') {
        populateCities();
    } else if (event.target.id === 'city') {
        populateDistricts();
    }
    filterSpecialists();
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
    
    // Render window systems section on home page
    if (document.querySelector('.window-systems')) {
        await UIUtils.renderWindowSystemsSection();
    }
    
    // Load and initialize sales specialists
    if (document.querySelector('.sales-specialists')) {
        await loadSalesSpecialists();
        
        // Filter event listeners
        const oblastSelect = document.getElementById('oblast');
        const citySelect = document.getElementById('city');
        const districtSelect = document.getElementById('district');
        
        if (oblastSelect) {
            oblastSelect.addEventListener('change', handleFilterChange);
        }
        if (citySelect) {
            citySelect.addEventListener('change', handleFilterChange);
        }
        if (districtSelect) {
            districtSelect.addEventListener('change', handleFilterChange);
        }
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