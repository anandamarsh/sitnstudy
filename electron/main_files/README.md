# Main Process Modules

This directory contains the modularized main process code for the Sit-N-Study Electron application.

## Current Structure

- `index.ts` - Main entry point (contains all code until extraction is complete)
- `ipc-handlers.ts` - IPC handlers for renderer communication
- `session-management.ts` - Electron session configuration and management
- `window-management.ts` - Main window and login window management
- `webview-handlers.ts` - Webview event handling and navigation control
- `devtools-config.ts` - DevTools configuration and keyboard shortcuts
- `menu-config.ts` - Application menu creation and configuration
- `app-lifecycle.ts` - App lifecycle event handling
- `constants.ts` - Constants and configuration values

## Extraction Plan

The code will be extracted from `index.ts` into these modules one by one:

1. **Constants** - Extract environment variables and build paths
2. **Session Management** - Extract shared session creation and configuration
3. **IPC Handlers** - Extract all IPC event handlers
4. **Window Management** - Extract window creation and management functions
5. **Webview Handlers** - Extract webview event handling and URL logging
6. **DevTools Config** - Extract DevTools configuration and shortcuts
7. **Menu Config** - Extract menu creation and configuration
8. **App Lifecycle** - Extract app event handlers and initialization

## Benefits

- **Modularity**: Each module has a single responsibility
- **Maintainability**: Easier to find and modify specific functionality
- **Testability**: Individual modules can be tested in isolation
- **Readability**: Smaller, focused files are easier to understand
- **Reusability**: Modules can be imported and used independently

## Next Steps

1. Extract constants and configuration
2. Extract session management
3. Extract IPC handlers
4. Extract window management
5. Extract webview handlers
6. Extract DevTools configuration
7. Extract menu configuration
8. Extract app lifecycle
9. Update index.ts to use all modules
10. Remove original code from index.ts
