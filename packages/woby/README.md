# @floating-ui/woby

[Floating UI](https://floating-ui.com) for [Woby](https://woby.dev) - a reference implementation for creating floating elements like tooltips, popovers, dropdowns, and more.

## Installation

```bash
npm install @floating-ui/woby
```

## Usage

```jsx
import { useFloating, offset, flip, shift } from '@floating-ui/woby';

function Tooltip() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    middleware: [offset(10), flip(), shift()],
  });

  return (
    <>
      <button
        ref={refs.setReference}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        Hover me
      </button>
      
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
        >
          I'm a tooltip!
        </div>
      )}
    </>
  );
}
```

## Core Features

- **Positioning**: Accurate positioning of floating elements with middleware
- **Middleware**: Built-in middleware for flipping, shifting, offsetting, and more
- **Woby Integration**: Designed specifically for Woby's reactivity system
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Hooks

### Core Hooks
- `useFloating` - Main hook for positioning floating elements
- `useClick` - Handle click interactions
- `useClientPoint` - Position elements relative to cursor
- `useDismiss` - Handle dismissal behavior (click outside, escape key)
- `useFocus` - Handle focus interactions
- `useHover` - Handle hover interactions
- `useInteractions` - Merge event listeners from multiple hooks
- `useListNavigation` - Handle keyboard navigation in lists
- `useMergeRefs` - Merge multiple refs into one

### Utility Hooks
- `useId` - Generate unique IDs for accessibility

## Middleware

All middleware from `@floating-ui/core` are available:

- `offset` - Offset the floating element
- `flip` - Flip the floating element when it overflows
- `shift` - Shift the floating element when it overflows
- `autoPlacement` - Automatically place the floating element
- `arrow` - Add an arrow to the floating element
- `size` - Size the floating element
- `hide` - Hide the floating element when it overflows
- `inline` - Position the floating element relative to inline elements

## License

MIT