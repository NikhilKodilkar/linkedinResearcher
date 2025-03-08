// Saves options to chrome.storage
function saveOptions() {
  const claudeApiKey = document.getElementById('claude-api-key').value;
  const status = document.getElementById('status');
  
  chrome.storage.sync.set(
    { claudeApiKey },
    () => {
      status.textContent = 'Settings saved successfully!';
      status.className = 'status success';
      
      // Reset status message after 2 seconds
      setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
      }, 2000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    { claudeApiKey: '' },
    (items) => {
      document.getElementById('claude-api-key').value = items.claudeApiKey;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 