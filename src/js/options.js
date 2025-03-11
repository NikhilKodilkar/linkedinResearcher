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
  }, (items) => {
    document.getElementById('claude-api-key').value = items.claudeApiKey;
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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 