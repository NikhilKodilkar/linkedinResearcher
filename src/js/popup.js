// Default prompt text
const DEFAULT_PROMPT = `You are analyzing screenshots of a LinkedIn profile and their posts. Please analyze these screenshots and provide information in the following structured format:

PROFILE ANALYSIS:
Name: [Full name of the person]
Current Position: [Current job title and company]
Location: [Current location]
Industry: [Industry they work in]
Experience Summary: [Brief summary of their work history, including years of experience and key roles]
Key Skills: [List their main skills and expertise areas]
Education: [List their educational background]
Languages: [Languages they know, if mentioned]
Certifications: [Any professional certifications, if present]

POSTS ANALYSIS:
Post Frequency: [How often they post, based on dates visible]
Content Focus: [Main topics/themes they post about]
Engagement Level: [Level of engagement their posts receive - likes, comments, etc.]
Professional Tone: [Analysis of their writing style and professionalism]
Key Interests: [Topics they frequently engage with or share]
Notable Achievements: [Any achievements or milestones mentioned in posts]

OVERALL ASSESSMENT:
Red Flags: [Any concerning patterns in profile or posts]
Recommendations: [Suggestions based on both profile and posting activity]
Active on LinkedIn: [Yes/No - justify based on profile completeness and posting activity]

Please be precise and factual, basing your analysis ONLY on what you can clearly see in the images. Format each response exactly as shown above, with the exact same labels. If any information is not available, simply omit that field rather than speculating.`;

// Initialize the UI
document.addEventListener('DOMContentLoaded', async () => {
  // Set default prompt
  document.getElementById('prompt').value = DEFAULT_PROMPT;

  // Get URL input element
  const urlInput = document.getElementById('profile-url');

  // Get current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.includes('linkedin.com')) {
      urlInput.value = tab.url;
    }
  } catch (error) {
    console.error('Error getting current tab:', error);
  }

  // Focus the URL input
  urlInput.focus();
  
  // Select the text if there's any
  if (urlInput.value) {
    urlInput.select();
  }

  // Initialize tab switching
  initializeTabs();

  // Initialize the research button
  initializeResearchButton();

  // Load and display current state
  const response = await chrome.runtime.sendMessage({ action: 'getState' });
  if (response) {
    updateUI(response);
    // Only set URL from last analysis if current tab is not LinkedIn
    if (!urlInput.value && response.lastUrl) {
      urlInput.value = response.lastUrl;
      urlInput.select();
    }
  }

  // Listen for state updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'stateUpdated') {
      updateUI(message.state);
    }
  });

  // Initialize dark mode
  initializeDarkMode();
});

async function updateUI(state) {
  const screenshotTab = document.getElementById('screenshots');
  const messageLog = document.getElementById('message-log');
  const analysisResults = document.getElementById('analysis-results');
  const analysisTableBody = document.getElementById('analysis-table-body');

  // Clear any existing last analysis info
  const existingLastAnalysisInfo = document.querySelector('.last-analysis-info');
  if (existingLastAnalysisInfo) {
    existingLastAnalysisInfo.remove();
  }

  // Update analysis results
  if (state.analysis) {
    analysisResults.style.display = 'block';
    
    // Add last analysis date if available
    if (state.lastAnalysisDate) {
      const lastAnalysisInfo = document.createElement('div');
      lastAnalysisInfo.className = 'last-analysis-info';
      lastAnalysisInfo.innerHTML = `Last analysis: ${new Date(state.lastAnalysisDate).toLocaleString()}`;
      analysisResults.insertBefore(lastAnalysisInfo, analysisResults.firstChild);
    }

    const sections = parseAnalysis(state.analysis);
    analysisTableBody.innerHTML = sections
      .map(([key, value]) => `
        <tr>
          <td>${key}</td>
          <td>${value}</td>
        </tr>
      `)
      .join('');
  } else {
    analysisResults.style.display = 'none';
    analysisTableBody.innerHTML = '';
  }

  // Update screenshot preview
  let hasScreenshots = (state.profileScreenshots && state.profileScreenshots.length > 0) || 
                      (state.postsScreenshots && state.postsScreenshots.length > 0);

  if (hasScreenshots) {
    let screenshotContainer = screenshotTab.querySelector('.screenshot-container');
    if (!screenshotContainer) {
      screenshotContainer = document.createElement('div');
      screenshotContainer.className = 'screenshot-container';
      screenshotTab.innerHTML = ''; // Clear the "No screenshots available" message
      screenshotTab.appendChild(screenshotContainer);
    } else {
      screenshotContainer.innerHTML = ''; // Clear existing screenshots
    }

    // Handle profile screenshots
    if (state.profileScreenshots && state.profileScreenshots.length > 0) {
      const profileSection = document.createElement('div');
      profileSection.className = 'screenshot-section';
      profileSection.innerHTML = '<h3>Profile Screenshots</h3>';
      
      state.profileScreenshots.forEach((screenshot, index) => {
        const img = document.createElement('img');
        img.src = screenshot;
        img.className = 'screenshot';
        profileSection.appendChild(img);
      });
      
      screenshotContainer.appendChild(profileSection);
    }

    // Handle posts screenshots
    if (state.postsScreenshots && state.postsScreenshots.length > 0) {
      const postsSection = document.createElement('div');
      postsSection.className = 'screenshot-section';
      postsSection.innerHTML = '<h3>Posts Screenshots</h3>';
      
      state.postsScreenshots.forEach((screenshot, index) => {
        const img = document.createElement('img');
        img.src = screenshot;
        img.className = 'screenshot';
        postsSection.appendChild(img);
      });
      
      screenshotContainer.appendChild(postsSection);
    }
  } else {
    screenshotTab.innerHTML = '<p>No screenshots available</p>';
  }

  // Update message log
  if (state.messages && state.messages.length > 0) {
    messageLog.innerHTML = state.messages
      .map(msg => `<div class="message ${msg.type}">${msg.text}</div>`)
      .join('');
    messageLog.scrollTop = messageLog.scrollHeight;
  } else {
    messageLog.innerHTML = '<p>No messages yet</p>';
  }
}

function parseAnalysis(analysis) {
  // Split the analysis into sections based on common patterns
  const sections = [];
  const lines = analysis.split('\n');
  
  let currentKey = '';
  let currentValue = '';
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    // Check if line starts with a key pattern (e.g., "PROFESSIONAL SUMMARY:", "Location:", etc.)
    const keyMatch = line.match(/^([^:]+):\s*(.+)$/);
    
    if (keyMatch) {
      // If we have a previous key-value pair, add it to sections
      if (currentKey) {
        sections.push([currentKey, currentValue.trim()]);
      }
      
      // Start new key-value pair
      currentKey = keyMatch[1].trim();
      currentValue = keyMatch[2].trim();
    } else {
      // Append to current value if it's a continuation
      if (currentValue) {
        currentValue += ' ' + line.trim();
      }
    }
  }
  
  // Add the last key-value pair
  if (currentKey) {
    sections.push([currentKey, currentValue.trim()]);
  }
  
  return sections;
}

// Tab switching functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchToTab(tab.dataset.tab));
  });
}

function switchToTab(tabId) {
  // Remove active class from all tabs and panes
  document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  // Add active class to clicked tab and corresponding pane
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Research button functionality
function initializeResearchButton() {
  const button = document.getElementById('start-research');
  button.addEventListener('click', async () => {
    const url = document.getElementById('profile-url').value;
    const prompt = document.getElementById('prompt').value;

    if (!isValidLinkedInUrl(url)) {
      addMessage('Please enter a valid LinkedIn profile URL', 'error');
      return;
    }

    // Disable the button and show loading state
    button.disabled = true;
    button.textContent = 'Analyzing...';

    try {
      const result = await chrome.runtime.sendMessage({
        action: 'captureAndAnalyze',
        url,
        prompt
      });

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      addMessage(`Error: ${error.message}`, 'error');
    } finally {
      // Re-enable the button
      button.disabled = false;
      button.textContent = 'Start Research';
    }
  });
}

// Validate LinkedIn URL
function isValidLinkedInUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
  } catch {
    return false;
  }
}

// Display screenshot in the Screenshots tab
function displayScreenshot(screenshotData) {
  const container = document.getElementById('screenshot-preview');
  container.innerHTML = `
    <img src="${screenshotData}" alt="LinkedIn Profile Screenshot">
  `;
}

// Display analysis in the Messages tab
function displayAnalysis(analysis) {
  addMessage('Analysis Results:', 'info');
  addMessage(analysis, 'success');
}

// Add a message to the message log
function addMessage(message, type = 'info') {
  const messageLog = document.getElementById('message-log');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  messageLog.appendChild(messageElement);
  messageLog.scrollTop = messageLog.scrollHeight;
}

// Dark mode toggle
function initializeDarkMode() {
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Check stored preference
  chrome.storage.sync.get(['darkMode'], (result) => {
    const darkMode = result.darkMode ?? prefersDark;
    if (darkMode) {
      document.body.classList.add('dark');
    }
  });
} 