import { $, $$, type ObservableMaybe, useEffect } from 'woby'
import { getWindow } from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

function createVirtualElement(
    reference: ReferenceType | null | undefined,
    data: {
        axis: 'x' | 'y' | 'both'
        pointerType: string | undefined
        x: number | null
        y: number | null
    },
) {
    let offsetX: number | null = null
    let offsetY: number | null = null
    let isAutoUpdateEvent = false

    // Extract the contextElement from the reference if it's a virtual element
    let contextElement: Element | undefined = undefined
    if (reference) {
        if ('contextElement' in reference) {
            contextElement = reference.contextElement as Element | undefined
        } else if (reference instanceof Element) {
            contextElement = reference
        }
    }

    return {
        contextElement: contextElement || undefined,
        getBoundingClientRect() {
            // Get the bounding rect from the context element if available
            const domRect = contextElement?.getBoundingClientRect() || {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
            }

            const isXAxis = data.axis === 'x' || data.axis === 'both'
            const isYAxis = data.axis === 'y' || data.axis === 'both'
            // Simplified for Woby - no dataRef.openEvent
            const canTrackCursorOnAutoUpdate = false

            let width = domRect.width
            let height = domRect.height
            let x = domRect.x
            let y = domRect.y

            if (offsetX == null && data.x && isXAxis) {
                offsetX = domRect.x - data.x
            }

            if (offsetY == null && data.y && isYAxis) {
                offsetY = domRect.y - data.y
            }

            x -= offsetX || 0
            y -= offsetY || 0
            width = 0
            height = 0

            if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
                width = data.axis === 'y' ? domRect.width : 0
                height = data.axis === 'x' ? domRect.height : 0
                x = isXAxis && data.x != null ? data.x : x
                y = isYAxis && data.y != null ? data.y : y
            } else if (isAutoUpdateEvent && !canTrackCursorOnAutoUpdate) {
                height = data.axis === 'x' ? domRect.height : height
                width = data.axis === 'y' ? domRect.width : width
            }

            isAutoUpdateEvent = true

            return {
                width,
                height,
                x,
                y,
                top: y,
                right: x + width,
                bottom: y + height,
                left: x,
            }
        },
    }
}

function isMouseBasedEvent(event: Event | undefined): event is MouseEvent {
    return event != null && (event as MouseEvent).clientX != null
}

export interface UseClientPointProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * Whether to restrict the client point to an axis and use the reference
     * element (if it exists) as the other axis. This can be useful if the
     * floating element is also interactive.
     * @default 'both'
     */
    axis?: 'x' | 'y' | 'both'
    /**
     * An explicitly defined `x` client coordinate.
     * @default null
     */
    x?: number | null
    /**
     * An explicitly defined `y` client coordinate.
     * @default null
     */
    y?: number | null
}

/**
 * Positions the floating element relative to a client point (in the viewport),
 * such as the mouse position. By default, it follows the mouse cursor.
 * @see https://floating-ui.com/docs/useClientPoint
 */
export function useClientPoint<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseClientPointProps = {},
): ElementProps {
    const {
        enabled = true,
        axis = 'both',
        x = null,
        y = null,
    } = props

    const { open, reason, reference: contextReference, floating: contextFloating, update } = context

    const initialRef = $<boolean>(false)
    const cleanupListenerRef = $<null | (() => void)>(null)
    const pointerType = $<string | undefined>(undefined)
    const reactive = $<any[]>([])

    const setReference = (x: number | null, y: number | null) => {
        if ($$(initialRef)) return

        // Create a virtual element based on the coordinates
        const virtualElement = createVirtualElement($$(contextReference), {
            x,
            y,
            axis,
            pointerType: $$(pointerType),
        })

        // Update the reference with the virtual element
        contextReference(virtualElement as unknown as RT)

        // Trigger an update to reposition the floating element
        update()
    }

    const handleReferenceEnterOrMove = (event: MouseEvent) => {
        if (x != null || y != null) return

        // Always call setReference on mouse move/enter, not just when closed
        setReference(event.clientX, event.clientY)
    }

    const isMouseLikePointerType = (pointerType: string | undefined): boolean => {
        return pointerType === 'mouse' || pointerType === 'pen'
    }

    // If the pointer is a mouse-like pointer, we want to continue following the
    // mouse even if the floating element is transitioning out. On touch
    // devices, this is undesirable because the floating element will move to
    // the dismissal touch point.
    const openCheck = () => {
        return isMouseLikePointerType($$(pointerType)) ? $$(contextFloating) : $$(open)
    }

    // Add effect to handle listener
    useEffect(() => {
        if (!enabled) return

        let cleanupFn: (() => void) | undefined

        const addListener = () => {
            // Explicitly specified `x`/`y` coordinates shouldn't add a listener.
            if (!openCheck() || x != null || y != null) return

            const win = getWindow($$(contextFloating))

            function handleMouseMove(event: MouseEvent) {
                const target = getTarget(event) as Element | null

                if (!contains($$(contextFloating), target)) {
                    setReference(event.clientX, event.clientY)
                } else {
                    win.removeEventListener('mousemove', handleMouseMove)
                    cleanupListenerRef(null)
                    if (cleanupFn) cleanupFn()
                }
            }

            // Add mouse move listener
            win.addEventListener('mousemove', handleMouseMove)
            const cleanup = () => {
                win.removeEventListener('mousemove', handleMouseMove)
                cleanupListenerRef(null)
            }
            cleanupListenerRef(cleanup)
            cleanupFn = cleanup
        }

        if (enabled && $$(open)) {
            addListener()
        }

        // Return dispose function
        return () => {
            if (cleanupFn) cleanupFn()
        }
    })

    const getTarget = (event: Event): EventTarget | null => {
        return event.target
    }

    const contains = (parent: Element | null, child: Element | null): boolean => {
        if (!parent || !child) return false
        return parent === child || parent.contains(child)
    }

    const referenceProps: ElementProps['reference'] = {
        onPointerDown: (event: PointerEvent) => {
            pointerType(event.pointerType)
        },
        onPointerEnter: (event: PointerEvent) => {
            pointerType(event.pointerType)
        },
        onMouseMove: handleReferenceEnterOrMove,
        onMouseEnter: handleReferenceEnterOrMove,
    }

    return enabled ? { reference: referenceProps } : {}
}