import UIUtils from './ui-utils.js';

// Модуль для загрузки повторяющихся компонентов (хедер, футер, сайдбар)
class ComponentsLoader {
    static async loadHeader() {
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
            this.initHamburgerMenu();

        } catch (error) {
            console.error('Ошибка загрузки хедера:', error);
        }
    }

    static async loadFooter() {
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

    static async loadSidebar() {
        try {
            const response = await fetch('sidebar.html');
            if (!response.ok) {
                throw new Error('Не удалось загрузить сайдбар');
            }
            const sidebarHtml = await response.text();
            const sidebarContainer = document.querySelector('.catalog-sidebar-container');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = sidebarHtml;
                // После загрузки HTML вызываем рендеринг динамического списка брендов
                await UIUtils.renderSidebar();
            }
        } catch (error) {
            console.error('Ошибка загрузки сайдбара:', error);
        }
    }

    static initHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (!hamburger || !navLinks) {
            console.warn('Hamburger or navLinks not found');
            return;
        }

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
        hamburger.addEventListener('click', toggleMenu);

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
    }
}

export default ComponentsLoader;