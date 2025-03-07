// Utility function to load an image from a data URL
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Function to combine multiple screenshots vertically
async function combineScreenshots(screenshots) {
  if (!screenshots || screenshots.length === 0) {
    return null;
  }
  
  if (screenshots.length === 1) {
    return screenshots[0];
  }

  // Load all images first
  const images = await Promise.all(screenshots.map(loadImage));
  
  // Calculate dimensions
  const maxWidth = Math.max(...images.map(img => img.width));
  const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  
  // Draw images
  let currentY = 0;
  for (const img of images) {
    // Center image horizontally if smaller than max width
    const x = (maxWidth - img.width) / 2;
    ctx.drawImage(img, x, currentY);
    currentY += img.height;
  }
  
  return canvas.toDataURL('image/png');
}

// Export functions
window.imageUtils = {
  combineScreenshots
}; 