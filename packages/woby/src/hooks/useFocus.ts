import { $, $$, type ObservableMaybe, type Observable, useEffect, batch } from 'woby'
import { getWindow, isElement, isHTMLElement } from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

function isMac() {
    return typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent)
}

function isSafari() {
    return typeof navigator !== 'undefined' && /apple/i.test(navigator.vendor)
}

function isMacSafari() {
    return isMac() && isSafari()
}

export interface UseFocusProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * Whether the open state only changes if the focus event is considered
     * visible (`:focus-visible` CSS selector).
     * @default true
     */
    visibleOnly?: boolean
}

/**
 * Opens the floating element while the reference element has focus, like CSS
 * `:focus`.
 * @see https://floating-ui.com/docs/useFocus
 */
export function useFocus<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseFocusProps = {},
): ElementProps {
    const { enabled = true, visibleOnly = true } = props

    const { open, reference: contextReference, floating: contextFloating, reason } = context

    const blockFocusRef = $<boolean>(false)
    const timeoutRef = $<number>(-1)
    const keyboardModalityRef = $<boolean>(true)

    const isTypeableElement = (element: Element | null): boolean => {
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

    const matchesFocusVisible = (element: Element): boolean => {
        // Simple implementation for focus-visible check
        // In a real implementation, this would check for the :focus-visible pseudo-class
        return true
    }

    const activeElement = (doc: Document): Element | null => {
        return doc.activeElement
    }

    const contains = (parent: Element | null, child: Element | null): boolean => {
        if (!parent || !child) return false
        return parent === child || parent.contains(child)
    }

    const getDocument = (node: Element | null): Document => {
        return node?.ownerDocument || document
    }

    const getTarget = (event: Event): EventTarget | null => {
        return event.target
    }

    // Setup event listeners using useEffect to ensure proper cleanup
    useEffect(() => {
        if (!enabled || !$$(contextReference)) return

        const win = getWindow($$(contextReference))
        const removeEventListeners: Array<() => void> = []

        // If the reference was focused and the user left the tab/window, and the
        // floating element was not open, the focus should be blocked when they
        // return to the tab/window.
        function onBlur() {
            if (
                !$$(open) &&
                isHTMLElement($$(contextReference) as Element) &&
                ($$(contextReference) as Element) ===
                activeElement(getDocument($$(contextReference) as Element))
            ) {
                blockFocusRef(true)
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            keyboardModalityRef(true)
        }

        function onPointerDown(event: PointerEvent) {
            keyboardModalityRef(false)
        }

        win.addEventListener('blur', onBlur)
        removeEventListeners.push(() => win.removeEventListener('blur', onBlur))

        if (isMacSafari()) {
            win.addEventListener('keydown', onKeyDown, true)
            removeEventListeners.push(() => win.removeEventListener('keydown', onKeyDown, true))

            win.addEventListener('pointerdown', onPointerDown, true)
            removeEventListeners.push(() => win.removeEventListener('pointerdown', onPointerDown, true))
        }

        // Return dispose function to clean up event listeners
        return () => {
            removeEventListeners.forEach(remove => remove())
        }
    })

    const referenceProps: ElementProps['reference'] = {
        onMouseLeave() {
            blockFocusRef(false)
        },
        onFocus(event: FocusEvent) {
            if ($$(blockFocusRef)) return

            const target = getTarget(event)

            if (visibleOnly && isElement(target)) {
                // Safari fails to match `:focus-visible` if focus was initially
                // outside the document.
                if (isMacSafari() && !event.relatedTarget) {
                    if (!$$(keyboardModalityRef) && !isTypeableElement(target as Element)) {
                        return
                    }
                } else if (!matchesFocusVisible(target as Element)) {
                    return
                }
            }

            batch(() => {
                open(true)
                reason('focus')
            })
        },
        onBlur(event: FocusEvent) {
            blockFocusRef(false)
            const relatedTarget = event.relatedTarget

            // Wait for the window blur listener to fire.
            clearTimeoutIfSet(timeoutRef)
            timeoutRef(window.setTimeout(() => {
                const activeEl = activeElement(
                    ($$(contextReference) as Element)
                        ? (($$(contextReference) as Element).ownerDocument || document)
                        : document,
                )

                // Focus left the page, keep it open.
                if (!relatedTarget && activeEl === ($$(contextReference) as Element)) return

                // When focusing the reference element (e.g. regular click), then
                // clicking into the floating element, prevent it from hiding.
                // Note: it must be focusable, e.g. `tabindex="-1"`.
                if (
                    contains(
                        $$(contextFloating) as Element,
                        activeEl,
                    ) ||
                    contains($$(contextReference) as Element, activeEl)
                ) {
                    return
                }

                batch(() => {
                    open(false)
                    reason('focus')
                })
            }))

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