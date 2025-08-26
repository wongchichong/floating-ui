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
    const position = usePosition<RT>(options as any)

    // Simple event emitter
    const events = {
        emit: (event: string, data?: any) => { },
        on: (event: string, handler: (data: any) => void) => { },
        off: (event: string, handler: (data: any) => void) => { },
    }

    // Watch for open state changes and emit events
    // useEffect(() => {
    //     // This will trigger whenever the open state changes
    //     const openValue = $$(position.open)
    //     events.emit('openchange', { open: openValue })
    // })

    // Return the flattened structure with Woby-specific properties
    return {
        ...position,
        events,
    } as UseFloatingReturn<RT>
}