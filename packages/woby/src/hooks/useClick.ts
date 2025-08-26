import { $, $$, type ObservableMaybe, batch } from 'woby'
import { isHTMLElement } from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, OpenChangeReason, ReferenceType } from '../types'

// Define the utility functions directly in this file since they're simple
function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean): boolean {
    // If strict, return false for any pointer type other than 'mouse'
    if (strict) {
        return pointerType === 'mouse'
    }

    // Treat pen like mouse for interactions
    return pointerType === 'mouse' || pointerType === 'pen'
}

function isTypeableElement(element: Element | null): boolean {
    if (!element) return false

    const tag = element.tagName.toLowerCase()
    const type = (element as HTMLInputElement).type

    return (
        tag === 'input' ||
        tag === 'textarea' ||
        (element as HTMLElement).isContentEditable ||
        // Check for input types that are typeable
        (tag === 'input' &&
            !['checkbox', 'radio', 'file', 'submit', 'reset', 'button', 'image', 'hidden'].includes(type))
    )
}

function isButtonTarget(event: KeyboardEvent) {
    return isHTMLElement(event.target as Element) && (event.target as HTMLElement).tagName === 'BUTTON'
}

function isAnchorTarget(event: KeyboardEvent) {
    return isHTMLElement(event.target as Element) && (event.target as HTMLElement).tagName === 'A'
}

function isSpaceIgnored(element: Element | null) {
    return isTypeableElement(element)
}

export interface UseClickProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * The type of event to use to determine a "click" with mouse input.
     * Keyboard clicks work as normal.
     * @default 'click'
     */
    event?: 'click' | 'mousedown'
    /**
     * Whether to toggle the open state with repeated clicks.
     * @default true
     */
    toggle?: boolean
    /**
     * Whether to ignore the logic for mouse input (for example, if `useHover()`
     * is also being used).
     * @default false
     */
    ignoreMouse?: boolean
    /**
     * Whether to add keyboard handlers (Enter and Space key functionality) for
     * non-button elements (to open/close the floating element via keyboard
     * "click").
     * @default true
     */
    keyboardHandlers?: boolean
    /**
     * If already open from another event such as the `useHover()` Hook,
     * determines whether to keep the floating element open when clicking the
     * reference element for the first time.
     * @default true
     */
    stickIfOpen?: boolean
}

function getDocument(node: Element | null) {
    return node?.ownerDocument || document
}

/**
 * Opens or closes the floating element when clicking the reference element.
 * @see https://floating-ui.com/docs/useClick
 */
export function useClick<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseClickProps = {}
): ElementProps {
    const {
        enabled = true,
        event: eventOption = 'click',
        toggle = true,
        ignoreMouse = false,
        keyboardHandlers = true,
        stickIfOpen = true,
    } = props

    const { open, reference: contextReference, reason } = context

    // In Woby, we store these in observables instead of refs
    const pointerType = $<string | undefined>(undefined)
    const didKeyDown = $(false)

    const referenceProps: ElementProps['reference'] = enabled ? {
        onPointerDown(event: PointerEvent) {
            pointerType(event.pointerType)
        },
        onMouseDown(event: MouseEvent) {
            const pointerTypeValue = $$(pointerType)

            // Ignore all buttons except for the "main" button.
            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
            if (event.button !== 0) return
            if (eventOption === 'click') return
            if (isMouseLikePointerType(pointerTypeValue, true) && ignoreMouse) return

            if (
                $$(open) &&
                toggle &&
                (stickIfOpen ? true : true) // Simplified for now
            ) {
                batch(() => {
                    open(false)
                    reason('click')
                })
            } else {
                // Prevent stealing focus from the floating element
                event.preventDefault()
                batch(() => {
                    open(true)
                    reason('click')
                })
            }
        },
        onClick(event: MouseEvent) {
            const pointerTypeValue = $$(pointerType)

            if (eventOption === 'mousedown' && pointerTypeValue) {
                pointerType(undefined)
                return
            }

            if (isMouseLikePointerType(pointerTypeValue, true) && ignoreMouse) return

            if (
                $$(open) &&
                toggle &&
                (stickIfOpen ? true : true) // Simplified for now
            ) {
                batch(() => {
                    open(false)
                    reason('click')
                })
            } else {
                batch(() => {
                    open(true)
                    reason('click')
                })
            }
        },
        onKeyDown(event: KeyboardEvent) {
            pointerType(undefined)

            if (
                event.defaultPrevented ||
                !keyboardHandlers ||
                isButtonTarget(event)
            ) {
                return
            }

            const domReference = contextReference ? $$(contextReference) : null

            if (event.key === ' ' && !isSpaceIgnored(domReference as Element | null)) {
                // Prevent scrolling
                event.preventDefault()
                didKeyDown(true)
            }

            if (isAnchorTarget(event)) {
                return
            }

            if (event.key === 'Enter') {
                if ($$(open) && toggle) {
                    batch(() => {
                        open(false)
                        reason('click')
                    })
                } else {
                    batch(() => {
                        open(true)
                        reason('click')
                    })
                }
            }
        },
        onKeyUp(event: KeyboardEvent) {
            const domReference = contextReference ? $$(contextReference) : null

            if (
                event.defaultPrevented ||
                !keyboardHandlers ||
                isButtonTarget(event) ||
                isSpaceIgnored(domReference as Element | null)
            ) {
                return
            }

            if (event.key === ' ' && $$(didKeyDown)) {
                didKeyDown(false)
                if ($$(open) && toggle) {
                    batch(() => {
                        open(false)
                        reason('click')
                    })
                } else {
                    batch(() => {
                        open(true)
                        reason('click')
                    })
                }
            }
        },
    } : undefined

    return {
        reference: referenceProps,
    }
}