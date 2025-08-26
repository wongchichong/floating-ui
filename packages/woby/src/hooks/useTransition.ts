import { $, $$, type ObservableMaybe } from 'woby'
import type { UseFloatingReturn, Placement, Side, ReferenceType } from '../types'

type Duration = number | { open?: number; close?: number }

// Converts a JS style key like `backgroundColor` to a CSS transition-property
// like `background-color`.
const camelCaseToKebabCase = (str: string): string =>
    str.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
    )

function execWithArgsOrReturn<Value extends object | undefined>(
    valueOrFn: Value | ((args: any) => Value),
    args: any,
): Value {
    return typeof valueOrFn === 'function' ? valueOrFn(args) : valueOrFn
}

function useDelayUnmount(open: boolean, durationMs: number): boolean {
    const isMounted = $(open)

    if (open && !$$(isMounted)) {
        isMounted(true)
    }

    return $$(isMounted)
}

export interface UseTransitionStatusProps {
    /**
     * The duration of the transition in milliseconds, or an object containing
     * `open` and `close` keys for different durations.
     */
    duration?: Duration
}

type TransitionStatus = 'unmounted' | 'initial' | 'open' | 'close'

/**
 * Provides a status string to apply CSS transitions to a floating element,
 * correctly handling placement-aware transitions.
 * @see https://floating-ui.com/docs/useTransition#usetransitionstatus
 */
export function useTransitionStatus<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseTransitionStatusProps = {},
): {
    isMounted: boolean
    status: TransitionStatus
} {
    const { open, reason, floating } = context
    const { duration = 250 } = props

    const isNumberDuration = typeof duration === 'number'
    const closeDuration = (isNumberDuration ? duration : duration.close) || 0

    const status = $<TransitionStatus>('unmounted')
    const isMounted = useDelayUnmount($$(open), closeDuration)

    if (!isMounted && $$(status) === 'close') {
        status('unmounted')
    }

    const floatingValue = $$(floating)
    if (floatingValue) {
        if ($$(open)) {
            status('initial')

            // In a real implementation, we would use requestAnimationFrame
            // For simplicity, we'll just set the status directly
            setTimeout(() => {
                status('open')
            }, 0)
        } else {
            status('close')
        }
    }

    return {
        isMounted,
        status: $$(status),
    }
}

type CSSStylesProperty =
    | Record<string, any>
    | ((params: { side: Side; placement: Placement }) => Record<string, any>)

export interface UseTransitionStylesProps extends UseTransitionStatusProps {
    /**
     * The styles to apply when the floating element is initially mounted.
     */
    initial?: CSSStylesProperty
    /**
     * The styles to apply when the floating element is transitioning to the
     * `open` state.
     */
    open?: CSSStylesProperty
    /**
     * The styles to apply when the floating element is transitioning to the
     * `close` state.
     */
    close?: CSSStylesProperty
    /**
     * The styles to apply to all states.
     */
    common?: CSSStylesProperty
}

/**
 * Provides styles to apply CSS transitions to a floating element, correctly
 * handling placement-aware transitions. Wrapper around `useTransitionStatus`.
 * @see https://floating-ui.com/docs/useTransition#usetransitionstyles
 */
export function useTransitionStyles<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseTransitionStylesProps = {},
): {
    isMounted: boolean
    styles: Record<string, any>
} {
    const {
        initial: unstable_initial = { opacity: 0 },
        open: unstable_open,
        close: unstable_close,
        common: unstable_common,
        duration = 250,
    } = props

    const { placement, reason } = context
    const placementValue = $$(placement)
    const side = (placementValue as string).split('-')[0] as Side
    const fnArgs = { side, placement: placementValue }
    const isNumberDuration = typeof duration === 'number'
    const openDuration = (isNumberDuration ? duration : duration.open) || 0
    const closeDuration = (isNumberDuration ? duration : duration.close) || 0

    const styles = $<Record<string, any>>({
        ...execWithArgsOrReturn(unstable_common, fnArgs),
        ...execWithArgsOrReturn(unstable_initial, fnArgs),
    })

    const { isMounted, status } = useTransitionStatus(context, { duration })

    if (status === 'initial') {
        const initialStyles = execWithArgsOrReturn(unstable_initial, fnArgs)
        const commonStyles = execWithArgsOrReturn(unstable_common, fnArgs)
        styles({
            transitionProperty: (styles as any).transitionProperty,
            ...commonStyles,
            ...initialStyles,
        })
    }

    if (status === 'open') {
        const openStyles =
            execWithArgsOrReturn(unstable_open, fnArgs) ||
            Object.keys(execWithArgsOrReturn(unstable_initial, fnArgs)).reduce((acc: Record<string, ''>, key) => {
                acc[key] = ''
                return acc
            }, {})

        styles({
            transitionProperty: Object.keys(openStyles)
                .map(camelCaseToKebabCase)
                .join(','),
            transitionDuration: `${openDuration}ms`,
            ...execWithArgsOrReturn(unstable_common, fnArgs),
            ...openStyles,
        })
    }

    if (status === 'close') {
        const closeStyles = execWithArgsOrReturn(unstable_close, fnArgs) || execWithArgsOrReturn(unstable_initial, fnArgs)
        const commonStyles = execWithArgsOrReturn(unstable_common, fnArgs)
        styles({
            transitionProperty: Object.keys(closeStyles)
                .map(camelCaseToKebabCase)
                .join(','),
            transitionDuration: `${closeDuration}ms`,
            ...commonStyles,
            ...closeStyles,
        })
    }

    return {
        isMounted,
        styles: $$(styles),
    }
}