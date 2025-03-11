// Save options to chrome.storage
function saveOptions() {
  const apiKey = document.getElementById('claude-api-key').value;
  const statusEl = document.getElementById('status');

  chrome.storage.sync.set({
    claudeApiKey: apiKey,
  }, () => {
    // Update status to let user know options were saved
    statusEl.textContent = 'Settings saved successfully!';
    statusEl.classList.remove('hidden', 'error');
    statusEl.classList.add('success');

    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 3000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({
    claudeApiKey: '', // default value
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
  }, (items) => {
    document.getElementById('claude-api-key').value = items.claudeApiKey;
    if (items.darkMode) {
      document.body.classList.add('dark');
    }
  });
}

// Error handler
function handleError(error) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = `Error: ${error.message}`;
  statusEl.classList.remove('hidden', 'success');
  statusEl.classList.add('error');

  setTimeout(() => {
    statusEl.classList.add('hidden');
  }, 3000);
}

// Toggle dark mode
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  chrome.storage.sync.set({ darkMode: isDark });
}

// Initialize
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode); 