import { $, $$, type ObservableMaybe, type Observable, useEffect, batch } from 'woby'
import { isElement, isHTMLElement } from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

export interface HandleClose {
    (context: any): (event: MouseEvent) => void
    __options?: any
}

export function getDelay(
    value: any,
    prop: 'open' | 'close',
    pointerType?: string,
) {
    if (pointerType && !isMouseLikePointerType(pointerType)) {
        return 0
    }

    if (typeof value === 'number') {
        return value
    }

    if (typeof value === 'function') {
        const result = value()
        if (typeof result === 'number') {
            return result
        }
        return result?.[prop]
    }

    return value?.[prop]
}

function getRestMs(value: number | (() => number)) {
    if (typeof value === 'function') {
        return value()
    }
    return value
}

function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean): boolean {
    if (strict) {
        return pointerType === 'mouse'
    }
    return pointerType === 'mouse' || pointerType === 'pen'
}

export interface UseHoverProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * Accepts an event handler that runs on `mousemove` to control when the
     * floating element closes once the cursor leaves the reference element.
     * @default null
     */
    handleClose?: HandleClose | null
    /**
     * Waits until the user's cursor is at "rest" over the reference element
     * before changing the `open` state.
     * @default 0
     */
    restMs?: number | (() => number)
    /**
     * Waits for the specified time when the event listener runs before changing
     * the `open` state.
     * @default 0
     */
    delay?: any
    /**
     * Whether the logic only runs for mouse input, ignoring touch input.
     * Note: due to a bug with Linux Chrome, "pen" inputs are considered "mouse".
     * @default false
     */
    mouseOnly?: boolean
    /**
     * Whether moving the cursor over the floating element will open it, without a
     * regular hover event required.
     * @default true
     */
    move?: boolean
}

/**
 * Opens the floating element while hovering over the reference element, like
 * CSS `:hover`.
 * @see https://floating-ui.com/docs/useHover
 */
export function useHover<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseHoverProps = {},
): ElementProps {
    const {
        enabled = true,
        delay = 0,
        handleClose = null,
        mouseOnly = false,
        restMs = 0,
        move = true,
    } = props

    const { open, reference: contextReference, floating: contextFloating, reason } = context

    const pointerTypeRef = $<string | undefined>(undefined)
    const timeoutRef = $<number>(-1)
    const handlerRef = $<((event: MouseEvent) => void) | undefined>(undefined)
    const restTimeoutRef = $<number>(-1)
    const blockMouseMoveRef = $<boolean>(true)
    const performedPointerEventsMutationRef = $<boolean>(false)
    const unbindMouseMoveRef = $<(() => void)>(() => { })
    const restTimeoutPendingRef = $<boolean>(false)

    const isOpenEvent = () => {
        // Simplified for Woby - no dataRef
        return false
    }

    const isClickLikeOpenEvent = () => {
        // Simplified for Woby - no dataRef
        return false
    }

    const closeWithDelay = (
        event: Event,
        runElseBranch = true,
        reasonValue: any = 'hover',
    ) => {
        const closeDelay = getDelay(delay, 'close', $$(pointerTypeRef))
        if (closeDelay) {
            const timeoutId = window.setTimeout(
                () => {
                    batch(() => {
                        open(false)
                        reason(reasonValue)
                    })
                },
                closeDelay,
            )
            // Store the timeout ID in a way that works with observables
            timeoutRef(timeoutId)
        } else if (runElseBranch) {
            batch(() => {
                open(false)
                reason(reasonValue)
            })
        }
    }

    const cleanupMouseMoveHandler = () => {
        $$(unbindMouseMoveRef)()
        handlerRef(undefined)
    }

    const clearPointerEvents = () => {
        if ($$(performedPointerEventsMutationRef)) {
            const body = getDocument($$(contextFloating)).body
            body.style.pointerEvents = ''
            body.removeAttribute('data-floating-ui-safe-polygon')
            performedPointerEventsMutationRef(false)
        }
    }

    const getDocument = (node: Element | null): Document => {
        return node?.ownerDocument || document
    }

    const contains = (parent: Element | null, child: Element | null): boolean => {
        if (!parent || !child) return false
        return parent === child || parent.contains(child)
    }

    // Registering the mouse events using useEffect to ensure proper cleanup
    useEffect(() => {
        if (!enabled || !contextReference) return

        let removeEventListeners = () => { }

        if ($$(contextReference)) {
            function onReferenceMouseEnter(event: MouseEvent) {
                clearTimeoutIfSet(timeoutRef)
                blockMouseMoveRef(false)

                if (
                    (mouseOnly && !isMouseLikePointerType($$(pointerTypeRef))) ||
                    (getRestMs(restMs) > 0 && !getDelay(delay, 'open'))
                ) {
                    return
                }

                const openDelay = getDelay(delay, 'open', $$(pointerTypeRef))

                if (openDelay) {
                    const timeoutId = window.setTimeout(() => {
                        if (!$$(open)) {
                            batch(() => {
                                open(true)
                                reason('hover')
                            })
                        }
                    }, openDelay)
                    timeoutRef(timeoutId)
                } else {
                    if (!$$(open)) {
                        batch(() => {
                            open(true)
                            reason('hover')
                        })
                    }
                }
            }

            function onReferenceMouseLeave(event: MouseEvent) {
                if (isClickLikeOpenEvent()) {
                    clearPointerEvents()
                    return
                }

                cleanupMouseMoveHandler()

                const doc = getDocument($$(contextFloating))
                clearTimeoutIfSet(restTimeoutRef)
                restTimeoutPendingRef(false)

                if (handleClose) {
                    // Prevent clearing `onScrollMouseLeave` timeout.
                    if (!$$(open)) {
                        clearTimeoutIfSet(timeoutRef)
                    }

                    const handler = handleClose({
                        x: event.clientX,
                        y: event.clientY,
                        onClose() {
                            clearPointerEvents()
                            cleanupMouseMoveHandler()
                            if (!isClickLikeOpenEvent()) {
                                batch(() => {
                                    open(false)
                                    reason('safe-polygon')
                                })
                            }
                        },
                    })

                    handlerRef(handler)

                    doc.addEventListener('mousemove', handler)
                    unbindMouseMoveRef(() => {
                        doc.removeEventListener('mousemove', handler)
                    })

                    return
                }

                // Allow interactivity without `safePolygon` on touch devices. With a
                // pointer, a short close delay is an alternative, so it should work
                // consistently.
                const shouldClose =
                    $$(pointerTypeRef) === 'touch'
                        ? !contains($$(contextFloating), event.relatedTarget as Element | null)
                        : true
                if (shouldClose) {
                    batch(() => {
                        open(false)
                        reason('hover')
                    })
                }
            }

            function onFloatingMouseEnter() {
                clearTimeoutIfSet(timeoutRef)
            }

            function onFloatingMouseLeave(event: MouseEvent) {
                if (!isClickLikeOpenEvent()) {
                    closeWithDelay(event, false, 'hover')
                }
            }

            if (isElement($$(contextReference) as Element)) {
                const reference = $$(contextReference) as Element
                const floating = $$(contextFloating)

                const removeListeners: Array<() => void> = []

                if (move) {
                    const moveHandler = (event: Event) => onReferenceMouseEnter(event as MouseEvent)
                    reference.addEventListener('mousemove', moveHandler, {
                        once: true,
                    })
                    removeListeners.push(() => reference.removeEventListener('mousemove', moveHandler))
                }

                const enterHandler = (event: Event) => onReferenceMouseEnter(event as MouseEvent)
                reference.addEventListener('mouseenter', enterHandler)
                removeListeners.push(() => reference.removeEventListener('mouseenter', enterHandler))

                const leaveHandler = (event: Event) => onReferenceMouseLeave(event as MouseEvent)
                reference.addEventListener('mouseleave', leaveHandler)
                removeListeners.push(() => reference.removeEventListener('mouseleave', leaveHandler))

                if (floating) {
                    const floatingEnterHandler = () => onFloatingMouseEnter()
                    floating.addEventListener('mouseenter', floatingEnterHandler)
                    removeListeners.push(() => floating.removeEventListener('mouseenter', floatingEnterHandler))

                    const floatingLeaveHandler = (event: Event) => onFloatingMouseLeave(event as MouseEvent)
                    floating.addEventListener('mouseleave', floatingLeaveHandler)
                    removeListeners.push(() => floating.removeEventListener('mouseleave', floatingLeaveHandler))
                }

                removeEventListeners = () => {
                    removeListeners.forEach(remove => remove())
                    cleanupMouseMoveHandler()
                    clearPointerEvents()
                }
            }
        }

        // Return dispose function to clean up event listeners
        return removeEventListeners
    })

    const referenceProps: ElementProps['reference'] = {
        onPointerDown: (event: PointerEvent) => {
            pointerTypeRef(event.pointerType)
        },
        onPointerEnter: (event: PointerEvent) => {
            pointerTypeRef(event.pointerType)
        },
        onMouseMove(event: MouseEvent) {
            function handleMouseMove() {
                if (!$$(blockMouseMoveRef) && !$$(open)) {
                    batch(() => {
                        open(true)
                        reason('hover')
                    })
                }
            }

            if (mouseOnly && !isMouseLikePointerType($$(pointerTypeRef))) {
                return
            }

            if (($$(open) || getRestMs(restMs) === 0)) {
                return
            }

            // Ignore insignificant movements to account for tremors.
            if (
                $$(restTimeoutPendingRef) &&
                event.movementX ** 2 + event.movementY ** 2 < 2
            ) {
                return
            }

            clearTimeoutIfSet(restTimeoutRef)

            if ($$(pointerTypeRef) === 'touch') {
                handleMouseMove()
            } else {
                restTimeoutPendingRef(true)
                const timeoutId = window.setTimeout(
                    handleMouseMove,
                    getRestMs(restMs),
                )
                restTimeoutRef(timeoutId)
            }
        },
    }

    return enabled ? { reference: referenceProps } : {}
}

function clearTimeoutIfSet(timeoutRef: Observable<number>) {
    const timeout = $$(timeoutRef)
    if (timeout > 0) {
        clearTimeout(timeout)
        timeoutRef(-1)
    }
}