import { $, $$, isObservable, type ObservableMaybe } from 'woby'
import {
    useFloating as usePosition,
} from '@floating-ui/woby-dom'
import type { VirtualElement } from '@floating-ui/dom'

import type {
    ExtendedRefs,
    FloatingContext,
    NarrowedElement,
    ReferenceType,
    UseFloatingOptions,
    UseFloatingReturn,
} from '../types'

/**
 * Provides data to position a floating element.
 * @see https://floating-ui.com/docs/useFloating
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
    options: UseFloatingOptions<RT> = {} as UseFloatingOptions<RT>,
): UseFloatingReturn<RT> {
    const {
        reference,
        floating,
        placement,
        strategy,
        middleware,
        platform,
        whileElementsMounted,
        open,
        transform,
        onOpenChange: onOpenChangeProp,
    } = options

    const position = usePosition<RT>({
        placement,
        strategy,
        middleware,
        platform,
        whileElementsMounted: whileElementsMounted as any,
        open,
        transform,
        reference,
        floating,
    })

    // Simple event emitter
    const events = {
        emit: (event: string, data?: any) => { },
        on: (event: string, handler: (data: any) => void) => { },
        off: (event: string, handler: (data: any) => void) => { },
    }

    // Open state as observable
    const openState = isObservable(open) ? open : $(open ?? false)

    // On open change handler
    const onOpenChange = (openValue: boolean, event?: Event, reason?: any) => {
        events.emit('openchange', { open: openValue, event, reason, nested: false })
        if (onOpenChangeProp) {
            onOpenChangeProp(openValue, event, reason)
        }
    }

    return {
        ...position,
        open: openState,
        onOpenChange,
        events,
    } as UseFloatingReturn<RT>
}