import { computePosition } from '@floating-ui/dom'
import { $, $$, useEffect, useMemo, isObservable, type Observable, type ObservableMaybe } from 'woby'
import { Observant, ObservantMaybe } from 'use-woby'

import type {
    ComputePositionConfig,
    ReferenceType,
    UseFloatingData,
    UseFloatingOptions,
    UseFloatingReturn,
    Strategy,
    Placement,
    MiddlewareData,
    OpenChangeReason,
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
    options: ObservantMaybe<UseFloatingOptions> = {},
): UseFloatingReturn<RT> {
    // Flatten all options into individual observables
    const placement = useObservable((options.placement || 'bottom') as Placement)
    const strategy = useObservable((options.strategy || 'absolute') as Strategy)
    const middleware = useObservable(options.middleware ?? [])
    const platform = useObservable(options.platform)
    const externalReference = useObservable(options.reference)
    const externalFloating = useObservable(options.floating)
    const transform = useObservable(options.transform ?? true)
    const whileElementsMounted = useObservable(options.whileElementsMounted)
    const open = useObservable((options.open || false) as boolean)

    // Individual data observables
    const x = $(0)
    const y = $(0)
    const middlewareData = $({} as MiddlewareData)
    const isPositioned = $(false)
    const reason = $(null as OpenChangeReason | null)

    const latestMiddleware = $((options.middleware ?? []) as any)

    // Watch for middleware changes
    useMemo(() => {
        const middlewareValue = $$(middleware)
        if (!deepEqual($$(latestMiddleware), middlewareValue)) {
            latestMiddleware(middlewareValue as any)
        }
    })

    // Use useObservable hook to handle external references
    const reference = useObservable(externalReference) as Observable<RT | null | undefined>
    const floating = useObservable(externalFloating)

    const isMounted = $(true)

    const update = () => {
        const refEl = $$(reference)
        const floatEl = $$(floating)

        if (!refEl || !floatEl) {
            return
        }

        const config: ComputePositionConfig = {
            placement: $$(placement),
            strategy: $$(strategy),
            middleware: $$(latestMiddleware) as any,
        }

        const platformValue = $$(platform)
        if (platformValue) {
            config.platform = platformValue
        }

        computePosition(refEl, floatEl, config).then(
            (result) => {
                const fullData = {
                    ...result,
                    // The floating element's position may be recomputed while it's closed
                    // but still mounted (such as when transitioning out). To ensure
                    // `isPositioned` will be `false` initially on the next open, avoid
                    // setting it to `true` when `open === false` (must be specified).
                    isPositioned: $$(open) !== false,
                }

                if ($$(isMounted)) {
                    // Update individual observables
                    x(fullData.x)
                    y(fullData.y)
                    middlewareData(fullData.middlewareData)
                    isPositioned(fullData.isPositioned)
                }
            },
        )
    }

    // Handle open state changes
    useEffect(() => {
        const openValue = $$(open)
        if (openValue === false && $$(isPositioned)) {
            isPositioned(false)
        }
    })

    // Main effect for positioning
    useEffect(() => {
        const referenceEl = $$(reference)
        const floatingEl = $$(floating)
        const whileMounted = $$(whileElementsMounted)

        if (referenceEl && floatingEl) {
            if (whileMounted) {
                return whileMounted(referenceEl, floatingEl, update)
            }

            update()
        }
    })

    const floatingStyles = useMemo(() => {
        const strategyValue = $$(strategy)
        const initialStyles = {
            position: strategyValue,
            left: 0,
            top: 0,
        }

        const floatingElement = $$(floating)
        if (!floatingElement) {
            return initialStyles
        }

        // Get the current values directly
        const xValue = $$(x)
        const yValue = $$(y)

        // Calculate the rounded values
        const roundedX = roundByDPR(floatingElement, xValue)
        const roundedY = roundByDPR(floatingElement, yValue)
        const transformValue = $$(transform)

        if (transformValue) {
            return {
                ...initialStyles,
                transform: `translate(${roundedX}px, ${roundedY}px)`,
                ...(getDPR(floatingElement) >= 1.5 && { willChange: 'transform' }),
            }
        }

        return {
            position: strategyValue,
            left: roundedX,
            top: roundedY,
        }
    })

    // Flatten the return object
    return {
        // Individual data properties (flattened)
        x,
        y,
        strategy,
        placement,
        middlewareData,
        isPositioned,
        // Methods
        update,
        open,
        reason,
        reference,
        floating,
        floatingStyles,
    }
}