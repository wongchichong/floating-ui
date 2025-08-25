// Essential hooks
export { useFloating } from './hooks/useFloating'
// export { useFloatingRootContext } from './hooks/useFloatingRootContext'
export { useId } from './hooks/useId'

// Re-export from woby-dom
export type * from './types'
export {
    arrow,
    autoPlacement,
    autoUpdate,
    computePosition,
    detectOverflow,
    flip,
    getOverflowAncestors,
    hide,
    inline,
    limitShift,
    offset,
    platform,
    shift,
    size,
} from '@floating-ui/woby-dom'

// Placeholder exports for components (to be implemented)
// export {FloatingArrow} from './components/FloatingArrow';
// export {FloatingPortal} from './components/FloatingPortal';
// export {FloatingFocusManager} from './components/FloatingFocusManager';

// Placeholder exports for additional hooks (to be implemented)
// export {useClick} from './hooks/useClick';
// export {useDismiss} from './hooks/useDismiss';
// export {useFocus} from './hooks/useFocus';
// export {useHover} from './hooks/useHover';
// export {useInteractions} from './hooks/useInteractions';
// export {useRole} from './hooks/useRole';