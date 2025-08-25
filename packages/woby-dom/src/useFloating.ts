import { computePosition } from '@floating-ui/dom'
import { $, $$, useEffect, useMemo, isObservable, type Observable, type ObservableMaybe } from 'woby'

import type {
    ComputePositionConfig,
    ReferenceType,
    UseFloatingData,
    UseFloatingOptions,
    UseFloatingReturn,
} from './types'
import { deepEqual } from './utils/deepEqual'
import { getDPR } from './utils/getDPR'
import { roundByDPR } from './utils/roundByDPR'
import { useObservable } from './utils/useObservable'

/**
 * Provides data to position a floating element.
 * @see https://floating-ui.com/docs/useFloating
 */
export function useFloating<RT extends ReferenceType = ReferenceType>(
    options: UseFloatingOptions = {},
): UseFloatingReturn<RT> {
    const {
        placement = 'bottom',
        strategy = 'absolute',
        middleware = [],
        platform,
        reference: externalReference,
        floating: externalFloating,
        transform = true,
        whileElementsMounted,
        open,
    } = options

    const data = $<UseFloatingData>({
        x: 0,
        y: 0,
        strategy,
        placement,
        middlewareData: {},
        isPositioned: false,
    })

    const latestMiddleware = $(middleware)

    // Watch for middleware changes
    useMemo(() => {
        if (!deepEqual($$(latestMiddleware), middleware)) {
            latestMiddleware(middleware)
        }
    })

    // Use useObservable hook to handle external references
    const reference = useObservable(externalReference)
    const floating = useObservable(externalFloating)

    const hasWhileElementsMounted = whileElementsMounted != null
    // const whileElementsMountedRef = whileElementsMounted
    const platformRef = useObservable(platform)
    const openRef = useObservable(open)

    const isMounted = $(true)

    const update = () => {
        const refEl = $$(reference)
        const floatEl = $$(floating)

        if (!refEl || !floatEl) {
            return
        }

        const config: ComputePositionConfig = {
            placement,
            strategy,
            middleware: $$(latestMiddleware),
        }

        const platformRefValue = $$(platformRef)
        if (platformRefValue) {
            config.platform = platformRefValue
        }

        computePosition(refEl, floatEl, config).then(
            (result) => {
                const fullData = {
                    ...result,
                    // The floating element's position may be recomputed while it's closed
                    // but still mounted (such as when transitioning out). To ensure
                    // `isPositioned` will be `false` initially on the next open, avoid
                    // setting it to `true` when `open === false` (must be specified).
                    isPositioned: $$(openRef) !== false,
                }
                if ($$(isMounted) && !deepEqual($$(data), fullData)) {
                    data(fullData)
                }
            },
        )
    }

    // Handle open state changes
    useEffect(() => {
        if (open === false && $$(data).isPositioned) {
            data({ ...$$(data), isPositioned: false })
        }
    })

    // Main effect for positioning
    useEffect(() => {
        const referenceEl = $$(reference)
        const floatingEl = $$(floating)

        if (referenceEl && floatingEl) {
            if (whileElementsMounted) {
                return whileElementsMounted(referenceEl, floatingEl, update)
            }

            update()
        }
    })

    const floatingStyles = useMemo(() => {
        const initialStyles = {
            position: strategy,
            left: 0,
            top: 0,
        }

        const floatingElement = $$(floating)
        if (!floatingElement) {
            return initialStyles
        }

        const currentData = $$(data)
        const x = roundByDPR(floatingElement, currentData.x)
        const y = roundByDPR(floatingElement, currentData.y)

        if (transform) {
            return {
                ...initialStyles,
                transform: `translate(${x}px, ${y}px)`,
                ...(getDPR(floatingElement) >= 1.5 && { willChange: 'transform' }),
            }
        }

        return {
            position: strategy,
            left: x,
            top: y,
        }
    })

    return {
        data,
        update,
        reference: reference as Observable<RT | null>,
        floating: floating as Observable<HTMLElement | null>,
        floatingStyles,
    }
}