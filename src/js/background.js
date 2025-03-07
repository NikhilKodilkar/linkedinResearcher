// Initialize API key when extension loads
chrome.runtime.onInstalled.addListener(() => {
  // Check if API key exists in storage
  chrome.storage.sync.get(['claudeApiKey'], (result) => {
    if (!result.claudeApiKey) {
      // If no API key is set, show options page
      chrome.runtime.openOptionsPage();
    }
  });
});

// Store the latest results
let currentState = {
  profileScreenshots: null,
  postsScreenshots: null,
  analysis: null,
  messages: []
};

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);

  if (request.action === 'captureAndAnalyze') {
    handleCaptureAndAnalyze(request.url, request.prompt)
      .then(sendResponse)
      .catch((error) => {
        console.error('Error in handleCaptureAndAnalyze:', error);
        updateState({
          messages: [...currentState.messages, { type: 'error', text: error.message }]
        });
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (request.action === 'getState') {
    sendResponse(currentState);
    return true;
  }
});

function updateState(newState) {
  currentState = { ...currentState, ...newState };
  // Store in chrome.storage for persistence
  chrome.storage.local.set({ currentState });
  
  // Notify popup of state change - handle case where popup might not be open
  chrome.runtime.sendMessage({ action: 'stateUpdated', state: currentState }).catch(error => {
    // Suppress the "receiving end does not exist" error as it's expected when popup is closed
    if (!error.message.includes('receiving end does not exist')) {
      console.error('Error updating state:', error);
    }
  });
}

async function captureFullPageScreenshots(tab, windowId, action = 'prepareForScreenshot') {
  const viewportHeight = Math.floor((await chrome.windows.get(windowId)).height * 0.9);
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action });
    if (!response.success) {
      throw new Error(`Failed to prepare page for screenshot (${action})`);
    }

    console.log('Page prepared, full height:', response.fullHeight);
    const fullHeight = response.fullHeight;
    const screenshots = [];
    let currentPosition = 0;

    while (currentPosition < fullHeight) {
      console.log(`Scrolling to position ${currentPosition} of ${fullHeight}`);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'scrollTo',
        position: currentPosition
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Capturing screenshot at position:', currentPosition);
      const screenshot = await chrome.tabs.captureVisibleTab(windowId, {
        format: 'png'
      });
      screenshots.push(screenshot);
      
      currentPosition += viewportHeight;
    }

    console.log(`Captured ${screenshots.length} screenshots`);
    return { screenshots };
  } catch (error) {
    console.error('Error capturing full page screenshots:', error);
    throw error;
  }
}

async function handleCaptureAndAnalyze(url, prompt) {
  try {
    updateState({ 
      profileScreenshots: null,
      postsScreenshots: null,
      analysis: null,
      messages: [{ type: 'info', text: 'Starting analysis...' }] 
    });

    const tab = await chrome.tabs.create({ url, active: true });
    const window = await chrome.windows.get(tab.windowId);
    
    if (!window.focused) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    // Wait for initial page load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Capture profile screenshots
    updateState({
      messages: [...currentState.messages, { type: 'info', text: 'Capturing profile screenshots...' }]
    });
    const { screenshots: profileScreenshots } = await captureFullPageScreenshots(tab, tab.windowId);
    
    updateState({
      profileScreenshots,
      messages: [...currentState.messages, { type: 'success', text: 'Profile screenshots captured successfully' }]
    });

    // Capture posts screenshots
    updateState({
      messages: [...currentState.messages, { type: 'info', text: 'Navigating to posts and capturing screenshots...' }]
    });
    const { screenshots: postsScreenshots } = await captureFullPageScreenshots(tab, tab.windowId, 'preparePosts');
    
    // Close the tab after capturing all screenshots
    await chrome.tabs.remove(tab.id);

    updateState({
      postsScreenshots,
      messages: [...currentState.messages, { type: 'success', text: 'Posts screenshots captured successfully' }]
    });

    const { claudeApiKey } = await chrome.storage.sync.get(['claudeApiKey']);
    console.log('Retrieved API key:', claudeApiKey ? 'Present' : 'Missing');
    
    if (!claudeApiKey) {
      throw new Error('Claude API key not found. Please configure it in the extension settings.');
    }

    updateState({
      messages: [...currentState.messages, { type: 'info', text: 'Sending screenshots to Claude for analysis...' }]
    });

    // Combine all screenshots for analysis
    const allScreenshots = [...profileScreenshots, ...postsScreenshots];
    const analysis = await analyzeWithClaude(allScreenshots, prompt, claudeApiKey);

    updateState({
      analysis,
      messages: [...currentState.messages, { type: 'success', text: 'Analysis completed successfully!' }]
    });

    return {
      success: true,
      profileScreenshots,
      postsScreenshots,
      analysis
    };
  } catch (error) {
    console.error('Error in capture and analyze:', error);
    updateState({
      messages: [...currentState.messages, { type: 'error', text: error.message }]
    });
    throw error;
  }
}

async function analyzeWithClaude(screenshots, prompt, apiKey) {
  try {
    console.log('Making API request to Claude...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            ...screenshots.map(screenshot => ({
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: screenshot.replace('data:image/png;base64,', '')
              }
            }))
          ]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error response:', error);
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
} 