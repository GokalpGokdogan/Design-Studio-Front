# Design Studio Frontend

An AI-powered web application for generating and managing UI designs on an infinite canvas workspace.

## Features

- 🤖 **AI Design Generation** - Generate complete UI designs from text prompts using LLM
- 🎨 **Infinite Canvas** - Unlimited workspace for multiple design iterations
- 🖱️ **Interactive Design Management** - Drag, drop, select, and organize designs
- 💾 **Project Persistence** - Automatic saving to backend with user authentication
- 📤 **Figma Export** - Export designs directly to Figma with token support
- 🔍 **Canvas Controls** - Zoom, pan, center, and auto-arrange functionality


## Prerequisites

- Node.js v16 or higher
- npm or yarn
- Backend API running (see backend documentation)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd design-studio-front

# Install dependencies
npm install
```

## Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── page.jsx              # Authentication page
│   ├── components/
│   │   ├── ComponentNode.jsx     # UI component renderer
│   │   ├── LayoutNode.jsx        # Layout container renderer
│   │   ├── DesignCanvas.jsx      # Design rendering engine
│   │   ├── InfiniteCanvas.jsx    # Infinite canvas workspace
│   │   └── ProjectsList.jsx      # Recent projects display
│   ├── studio/
│   │   └── page.jsx              # Main studio workspace
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Landing page
├── hooks/
│   └── useAuth.js                # Authentication hook
└── lib/
    └── api.js                    # API client functions
```

## Key Components

### InfiniteCanvas
The main workspace component.

### DesignCanvas
Renders generated designs.

### ComponentNode
Handles individual UI components.

### LayoutNode
Manages layout containers.


## Usage

### Creating a Design

1. Enter a descriptive prompt in the input field
2. Click "Generate" or press Enter
3. Wait for AI to generate the design
4. Design appears on the infinite canvas

### Managing Designs

- **Select**: Click on any design
- **Move**: Drag selected designs
- **Pan Canvas**: Click and drag empty space
- **Zoom**: Use mouse wheel
- **Delete**: Click X on design header

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Center view on all designs |
| `A` | Auto-arrange designs |
| `R` | Reset view to default |
| `Scroll` | Zoom in/out |

### Exporting to Figma

1. Select a design by clicking it
2. Click "Export to Figma" in the selection panel
3. Copy the generated export ID
4. Use the ID in Figma plugin

## API Integration

The frontend communicates with the backend API for:

- **Design Generation**: `POST /api/generate-design`
- **Project Management**: `GET/POST/PUT /api/projects`
- **Figma Export**: `POST /api/export-figma-tokens`
- **Authentication**: Cookie-based session management

## Technologies Used

- **Framework**: Next.js 14
- **UI**: React 18, Tailwind CSS
- **Icons**: Heroicons
- **State**: React Hooks
- **HTTP**: Fetch API

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Some Dev. Notes
### AI-Generated Code
Some code in this project was written with the assistance of LLM services to accelerate MVP development and explore underlying design concepts. These sections will be thoroughly reviewed and refined in subsequent iterations.

### Continuous Improvement
I am actively working on enhancing the user experience with ongoing optimizations for performance, reliability, and cross-platform compatibility. Your feedback is valuable as we continue to improve the application.