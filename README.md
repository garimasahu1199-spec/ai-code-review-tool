# AI Code Review Tool

A modern, production-ready frontend for an AI-powered code review application built with React, Tailwind CSS, and Zustand state management.

![AI Code Review Tool](https://img.shields.io/badge/React-18.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)

## Features

- **Multi-Language Support**: JavaScript, Python, Java, C++, TypeScript, Go, Rust
- **AI-Powered Analysis**: Mock API with realistic code review responses
- **Syntax Highlighting**: Prism.js-powered code editor with language detection
- **Dark Mode UI**: Modern, professional dark theme inspired by VS Code
- **File Upload**: Drag-and-drop file upload with automatic language detection
- **Review History**: Persistent storage of all code reviews using Zustand
- **Download Reports**: Export review results as text files
- **Responsive Design**: Mobile and desktop optimized
- **Smooth Animations**: Framer Motion animations throughout

## Tech Stack

- **Frontend**: React 18 with Hooks and Functional Components
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand with persistence
- **Routing**: React Router v6
- **HTTP Client**: Axios with mock API integration
- **Code Editor**: react-simple-code-editor with Prism.js
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository or extract the project files

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Button component with variants
│   ├── Card.jsx        # Card container components
│   ├── CodeEditor.jsx  # Code editor with syntax highlighting
│   ├── FileUpload.jsx  # File upload with drag-and-drop
│   ├── IssueCard.jsx   # Issue/warning display card
│   ├── LanguageSelector.jsx  # Language dropdown
│   ├── Layout.jsx      # App layout wrapper
│   ├── LoadingSpinner.jsx    # Animated loading indicator
│   ├── Navbar.jsx      # Navigation bar
│   └── ScoreBadge.jsx  # Score display component
├── pages/              # Application pages
│   ├── Home.jsx        # Landing page with hero section
│   ├── CodeEditor.jsx  # Main code editor page
│   ├── ReviewResults.jsx     # Review results display
│   └── History.jsx     # Review history page
├── services/           # API services
│   └── api.js          # API client and mock endpoints
├── store/              # State management
│   └── useCodeStore.js # Zustand store with persistence
├── utils/              # Utility functions
│   └── helpers.js      # Helper functions
├── App.jsx             # Main app component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles and Tailwind
```

## Features Overview

### Home Page
- Hero section with animated code preview
- Feature highlights with icons
- Quick navigation to editor and history

### Code Editor Page
- Full-featured code editor with syntax highlighting
- Language selector dropdown
- File upload with automatic language detection
- Code download and copy functionality
- Clear/reset functionality
- Loading state during review

### Review Results Page
- Overall code quality score with visual badge
- Categorized issues (Critical, Warning, Suggestions)
- Security warnings
- Performance suggestions
- Optimized/refactored code display
- Download full report as text file

### History Page
- List of all previous reviews
- Expandable review details
- Language badges and scores
- Load code back to editor
- Delete individual entries or clear all

## API Integration

The application includes a mock API for demonstration purposes. To connect to a real backend:

1. Set the API URL in environment variables:
```env
VITE_API_URL=http://your-api-url/api
```

2. The expected API endpoint:
```
POST /api/review
Request: { code: string, language: string }
Response: {
  summary: string,
  overallScore: number,
  issues: Array,
  securityWarnings: Array,
  suggestions: Array,
  optimizedCode: string|null,
  reviewedAt: string
}
```

## Customization

### Adding New Languages

1. Add language to the `languages` array in `LanguageSelector.jsx`
2. Import the Prism grammar in `CodeEditor.jsx`
3. Add file extension mapping in `CodeEditor.jsx` (page)

### Theming

The application uses a custom dark theme. Modify colors in:
- `tailwind.config.js` - Custom color palette
- `src/index.css` - Prism.js syntax highlighting colors

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
