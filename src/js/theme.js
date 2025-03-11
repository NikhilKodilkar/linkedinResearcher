// Theme handling
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme from storage or use system preference
    chrome.storage.local.get('theme', ({ theme }) => {
        if (theme === 'dark' || (theme === undefined && prefersDark.matches)) {
            document.body.classList.add('dark');
        }
    });

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    });

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        chrome.storage.local.set({ theme: e.matches ? 'dark' : 'light' });
    });
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme); 