# Cheatsheets Remastered

An enhanced Raycast extension for managing and creating cheatsheets with both local storage and DevHints integration.

## Features

- **Search Cheatsheets**: Search through custom and DevHints cheatsheets
- **Create Custom Cheatsheets**: Build your own cheatsheets with markdown support
- **Local Storage**: All custom cheatsheets are stored locally
- **Import/Export**: Import cheatsheets from JSON or Markdown
- **DevHints Integration**: Access popular cheatsheets from devhints.io
- **Tagging & Categories**: Organize cheatsheets with tags and categories

## Commands

### Search Cheatsheets
Search through all available cheatsheets (custom and DevHints) with filtering options.

### Create Cheatsheet
Create a new custom cheatsheet with:
- Title and description
- Content (markdown supported)
- Category and tags
- Automatic timestamping

### My Cheatsheets
View and manage your custom cheatsheets:
- List all custom cheatsheets
- Copy content to clipboard
- Delete cheatsheets
- View creation/update dates

### Import Cheatsheet
Import cheatsheets from:
- JSON format (with full metadata)
- Markdown files (auto-extracts title)

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build extension
npm run build

# Lint and fix
npm run lint
npm run fix-lint
```

## Structure

```
src/
├── commands/          # Raycast command components
├── lib/              # Utility libraries
├── types/            # TypeScript type definitions
└── index.ts          # Main entry point
```

## Customization

The extension uses local storage for custom cheatsheets, so they persist between sessions. You can:

- Create cheatsheets for your specific workflows
- Import existing documentation
- Organize with custom categories and tags
- Export for sharing with team members

## License

MIT
