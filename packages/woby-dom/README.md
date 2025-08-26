# @floating-ui/woby-dom

DOM platform implementation for [Floating UI](https://floating-ui.com) with [Woby](https://woby.dev) integration.

This package provides the DOM-specific platform and utilities for Floating UI in Woby applications.

## Installation

```bash
npm install @floating-ui/woby-dom
```

## Usage

This package is typically used as a dependency of `@floating-ui/woby` and provides the underlying DOM platform implementation.

```jsx
import { computePosition, autoUpdate } from '@floating-ui/woby-dom';

// Used internally by @floating-ui/woby
```

## Features

- **DOM Platform**: Provides DOM-specific platform implementation for Floating UI
- **Reactive Middleware**: Woby-optimized middleware implementations
- **Auto Update**: Efficient auto-update mechanism for floating elements
- **Utilities**: DOM-specific utilities for floating element positioning

## API

### Core Functions
- `computePosition` - Compute the position of a floating element
- `autoUpdate` - Automatically update the position when needed
- `detectOverflow` - Detect overflow of floating element
- `getOverflowAncestors` - Get overflow ancestors of an element
- `platform` - DOM platform implementation

### Reactive Middleware
- `arrow` - Add an arrow to the floating element
- `autoPlacement` - Automatically place the floating element
- `flip` - Flip the floating element when it overflows
- `hide` - Hide the floating element when it overflows
- `inline` - Position relative to inline elements
- `limitShift` - Limit the shift of the floating element
- `offset` - Offset the floating element
- `shift` - Shift the floating element when it overflows
- `size` - Size the floating element

## Utilities

- `isMouseLikePointerType` - Check if pointer type is mouse-like
- `isTypeableElement` - Check if element is typeable

## License

MIT