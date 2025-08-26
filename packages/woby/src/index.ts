// Essential hooks
export { useFloating } from './hooks/useFloating'
// export { useFloatingRootContext } from './hooks/useFloatingRootContext'
export { useId } from './hooks/useId'

// Interaction hooks
export { useClick } from './hooks/useClick'
export { useClientPoint } from './hooks/useClientPoint'
export { useDismiss } from './hooks/useDismiss'
export { useFocus } from './hooks/useFocus'
export { useHover } from './hooks/useHover'
export { useInteractions } from './hooks/useInteractions'
export { useListNavigation } from './hooks/useListNavigation'
export { useMergeRefs } from './hooks/useMergeRefs'
export { useRole } from './hooks/useRole'
export { useTransitionStatus, useTransitionStyles } from './hooks/useTransition'
export { useTypeahead } from './hooks/useTypeahead'

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