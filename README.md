# Theme Editor

A simplified CSS theme editor for shadcn/ui and Tailwind CSS projects. This application is built as a static site generator (SSG) with client-side state management using localStorage.

## Features

- Visual theme editor with real-time preview
- Color customization with HSL and OKLCH support
- Font selection
- Code generation
- CSS import
- Responsive design with mobile and desktop layouts

## Getting Started

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Run the development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to access the theme editor.

## Building for Production

```bash
# Build static site
npm run build

# The output will be in the 'out' directory
# You can deploy this to any static hosting service
```

## Usage

1. Use the left panel to customize colors and properties
2. Preview changes in real-time on the right panel
3. Click the "Code" button to view and copy the generated CSS
4. Use the "Import" button to import existing CSS
5. Your themes are saved in your browser's localStorage

## Technology

- Astro (Static Site Generation)
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- localStorage for persistent data storage
