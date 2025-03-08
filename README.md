# LinkedIn Profile Researcher

A Chrome extension that analyzes LinkedIn profiles using Claude AI. The extension captures full-page screenshots of both the profile and posts sections, then uses Claude's advanced image analysis capabilities to provide detailed insights.

## Features

- 🔍 **Full Profile Analysis**: Captures and analyzes the entire LinkedIn profile, including:
  - Professional summary
  - Work experience
  - Education
  - Skills
  - Certifications
  - Languages

- 📝 **Posts Analysis**: Analyzes the user's LinkedIn posts to understand:
  - Posting frequency
  - Content themes
  - Engagement levels
  - Writing style
  - Professional interests

- 📸 **Smart Screenshot Capture**:
  - Automatically expands all "see more" sections
  - Captures full-length profile screenshots
  - Navigates to posts section
  - Expands all posts
  - Combines multiple screenshots for complete coverage

- 🤖 **AI-Powered Analysis**:
  - Uses Claude 3 Haiku for image analysis
  - Provides structured insights
  - Identifies potential red flags
  - Offers recommendations

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/NikhilKodilkar/linkedinResearcher.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the cloned repository folder

## Configuration

Before using the extension, you need to configure your Claude API key:

1. Get your API key from [Anthropic](https://www.anthropic.com/)
2. Click the extension icon and select "Options"
3. Enter your Claude API key
4. Click "Save"

## Usage

1. Navigate to any LinkedIn profile you want to analyze

2. Click the extension icon in your Chrome toolbar

3. Click "Start Research"

4. The extension will:
   - Capture the profile section
   - Navigate to and capture the posts section
   - Send screenshots to Claude for analysis
   - Display results in a structured format

5. View results in three tabs:
   - Main: Analysis results
   - Screenshots: Captured profile and posts
   - Messages: Progress updates

## Analysis Output

The extension provides analysis in three main sections:

### Profile Analysis
- Name
- Current Position
- Location
- Industry
- Experience Summary
- Key Skills
- Education
- Languages
- Certifications

### Posts Analysis
- Post Frequency
- Content Focus
- Engagement Level
- Professional Tone
- Key Interests
- Notable Achievements

### Overall Assessment
- Red Flags
- Recommendations
- LinkedIn Activity Level

## Development

### Project Structure
```
linkedinResearcher/
├── src/
│   ├── js/
│   │   ├── background.js    # Extension background script
│   │   ├── content.js       # Content script for LinkedIn page interaction
│   │   ├── popup.js         # Extension popup UI logic
│   │   ├── options.js       # Options page logic
│   │   └── imageUtils.js    # Screenshot handling utilities
│   ├── css/
│   │   └── styles.css       # Extension styles
│   ├── popup.html          # Extension popup UI
│   └── options.html        # Options page UI
├── manifest.json           # Extension manifest
└── README.md              # This file
```

### Key Components

1. **Content Script** (`content.js`):
   - Handles LinkedIn page interaction
   - Expands profile sections
   - Navigates to posts
   - Manages scrolling and screenshot preparation

2. **Background Script** (`background.js`):
   - Manages extension state
   - Handles screenshot capture
   - Communicates with Claude API
   - Coordinates analysis flow

3. **Popup UI** (`popup.js`, `popup.html`):
   - User interface for starting analysis
   - Displays results and progress
   - Shows captured screenshots

## Privacy & Security

- No data is stored on external servers
- API keys are stored securely in Chrome's storage
- Screenshots are processed in memory and not saved permanently
- All analysis is performed using Claude's secure API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Anthropic's Claude API](https://www.anthropic.com/) for AI analysis
- Chrome Extensions API
- LinkedIn's platform 