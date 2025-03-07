// Save options to chrome.storage
function saveOptions() {
  const claudeApiKey = document.getElementById('claude-api-key').value;
  
  chrome.storage.sync.set(
    {
      claudeApiKey: claudeApiKey,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Settings saved.';
      status.className = 'success';
      setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 3000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    {
      claudeApiKey: '',
    },
    (items) => {
      document.getElementById('claude-api-key').value = items.claudeApiKey;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 