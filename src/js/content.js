// Function to expand all "see more" sections
async function expandAllSections() {
  let lastButtonCount = 0;
  let currentButtonCount = 1; // Start with 1 to enter the loop
  let attempts = 0;
  const maxAttempts = 5;

  while (lastButtonCount !== currentButtonCount && attempts < maxAttempts) {
    lastButtonCount = currentButtonCount;
    
    // Find all "see more" buttons
    const seeMoreButtons = document.querySelectorAll(`
      button.inline-show-more-text__button,
      button[aria-expanded="false"].inline-show-more-text__button--light
    `);
    
    currentButtonCount = seeMoreButtons.length;
    console.log(`Found ${currentButtonCount} 'see more' buttons on attempt ${attempts + 1}`);
    
    // Click all visible buttons
    for (const button of seeMoreButtons) {
      if (button.textContent.trim().toLowerCase().includes('see more')) {
        try {
          button.click();
          // Wait a bit for the content to expand
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error clicking button:', error);
        }
      }
    }

    // Scroll down to reveal more content
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    attempts++;
  }

  // Scroll back to top
  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Function to scroll the page and capture viewport heights
async function getFullPageHeight() {
  // First scroll to top
  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));

  let totalHeight = 0;
  let lastHeight = 0;
  const viewportHeight = window.innerHeight;
  
  while (true) {
    window.scrollTo(0, totalHeight);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const scrollHeight = document.documentElement.scrollHeight;
    console.log(`Current scroll position: ${totalHeight}, Total height: ${scrollHeight}`);
    
    if (totalHeight >= scrollHeight || lastHeight === scrollHeight) {
      break;
    }
    
    lastHeight = scrollHeight;
    totalHeight += viewportHeight;
  }
  
  // Final scroll back to top
  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return document.documentElement.scrollHeight;
}

// Function to scroll to a specific position
async function scrollToPosition(position) {
  console.log(`Scrolling to position: ${position}`);
  window.scrollTo(0, position);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Look for and expand any new "see more" buttons that might have appeared
  const seeMoreButtons = document.querySelectorAll(`
    button.inline-show-more-text__button,
    button[aria-expanded="false"].inline-show-more-text__button--light
  `);
  
  for (const button of seeMoreButtons) {
    const rect = button.getBoundingClientRect();
    // Only click buttons that are currently visible in the viewport
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
      if (button.textContent.trim().toLowerCase().includes('see more')) {
        try {
          button.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error clicking button:', error);
        }
      }
    }
  }
}

// Function to click "Show all posts" and wait for posts to load
async function navigateToAllPosts() {
  console.log('Looking for "Show all posts" button...');
  
  // Try multiple selectors and approaches to find the button
  let showAllPostsButton = null;
  
  // Attempt 1: Direct span with text
  showAllPostsButton = Array.from(document.querySelectorAll('span.artdeco-button__text'))
    .find(span => span.textContent.trim() === 'Show all posts');

  // Attempt 2: Look for any span with the text
  if (!showAllPostsButton) {
    showAllPostsButton = Array.from(document.querySelectorAll('span'))
      .find(span => span.textContent.trim() === 'Show all posts');
  }

  // Attempt 3: Look for button with aria-label
  if (!showAllPostsButton) {
    showAllPostsButton = document.querySelector('button[aria-label*="posts"]');
  }

  // Attempt 4: Look for any link containing "posts"
  if (!showAllPostsButton) {
    const postsLink = Array.from(document.querySelectorAll('a'))
      .find(a => a.textContent.toLowerCase().includes('posts'));
    if (postsLink) {
      console.log('Found posts link, navigating...');
      postsLink.click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }
  }

  if (!showAllPostsButton) {
    // Try scrolling down a bit to reveal the button if it's not immediately visible
    window.scrollTo(0, 500);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showAllPostsButton = Array.from(document.querySelectorAll('span'))
      .find(span => span.textContent.trim() === 'Show all posts');
  }

  if (!showAllPostsButton) {
    // If we still can't find the button, try looking for the posts tab in the profile navigation
    const postsTab = Array.from(document.querySelectorAll('a'))
      .find(a => a.getAttribute('href')?.includes('/recent-activity/') || 
                 a.textContent.toLowerCase().includes('activity'));
    
    if (postsTab) {
      console.log('Found posts tab, navigating...');
      postsTab.click();
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }
  }

  if (!showAllPostsButton) {
    // If we still can't find any posts link, try constructing the posts URL
    const currentUrl = window.location.href.split('?')[0]; // Remove any query parameters
    if (!currentUrl.endsWith('/')) {
      window.location.href = currentUrl + '/recent-activity/';
      await new Promise(resolve => setTimeout(resolve, 5000));
      return;
    }
  }

  if (!showAllPostsButton) {
    throw new Error('Could not find any way to access posts section');
  }

  // If we found the button, click it
  console.log('Found "Show all posts" button, clicking...');
  const buttonToClick = showAllPostsButton.closest('button') || showAllPostsButton;
  buttonToClick.click();
  
  // Wait for posts page to load
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// Function to expand all "...more" in posts
async function expandAllPosts() {
  let lastExpandedCount = 0;
  let currentExpandedCount = 1; // Start with 1 to enter the loop
  let attempts = 0;
  const maxAttempts = 5;

  while (lastExpandedCount !== currentExpandedCount && attempts < maxAttempts) {
    lastExpandedCount = currentExpandedCount;
    
    // Find all "...more" spans
    const moreBtns = Array.from(document.querySelectorAll('span'))
      .filter(span => span.textContent.trim() === '…more');
    
    currentExpandedCount = moreBtns.length;
    console.log(`Found ${currentExpandedCount} '...more' buttons on attempt ${attempts + 1}`);
    
    // Click each "...more" button
    for (const btn of moreBtns) {
      try {
        btn.click();
        // Wait a bit for the content to expand
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error clicking ...more button:', error);
      }
    }

    // Scroll down to reveal more posts
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    attempts++;
  }

  // Scroll back to top
  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'prepareForScreenshot') {
    (async () => {
      try {
        console.log('Starting page preparation...');
        await expandAllSections();
        console.log('All sections expanded, getting page height...');
        const fullHeight = await getFullPageHeight();
        console.log('Page preparation complete, full height:', fullHeight);
        sendResponse({ success: true, fullHeight });
      } catch (error) {
        console.error('Error preparing page:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'preparePosts') {
    (async () => {
      try {
        console.log('Starting posts preparation...');
        await navigateToAllPosts();
        await expandAllPosts();
        const fullHeight = await getFullPageHeight();
        console.log('Posts preparation complete, full height:', fullHeight);
        sendResponse({ success: true, fullHeight });
      } catch (error) {
        console.error('Error preparing posts:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'scrollTo') {
    (async () => {
      try {
        await scrollToPosition(request.position);
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error scrolling:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Will respond asynchronously
  }
}); 