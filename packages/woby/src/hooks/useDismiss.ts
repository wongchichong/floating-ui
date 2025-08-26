import { $, $$, type ObservableMaybe, type Observable, useEffect, batch } from 'woby'
import { getOverflowAncestors } from '@floating-ui/woby-dom'
import {
    getComputedStyle,
    getParentNode,
    isElement,
    isHTMLElement,
    isLastTraversableNode,
} from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

const bubbleHandlerKeys = {
    pointerdown: 'onPointerDown',
    mousedown: 'onMouseDown',
    click: 'onClick',
}

const captureHandlerKeys = {
    pointerdown: 'onPointerDownCapture',
    mousedown: 'onMouseDownCapture',
    click: 'onClickCapture',
}

const normalizeProp = (
    normalizable?: boolean | { escapeKey?: boolean; outsidePress?: boolean },
) => {
    return {
        escapeKey:
            typeof normalizable === 'boolean'
                ? normalizable
                : normalizable?.escapeKey ?? false,
        outsidePress:
            typeof normalizable === 'boolean'
                ? normalizable
                : normalizable?.outsidePress ?? true,
    }
}

export interface UseDismissProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * Whether to dismiss the floating element upon pressing the `esc` key.
     * @default true
     */
    escapeKey?: boolean
    /**
     * Whether to dismiss the floating element upon pressing the reference
     * element. You likely want to ensure the `move` option in the `useHover()`
     * Hook has been disabled when this is in use.
     * @default false
     */
    referencePress?: boolean
    /**
     * The type of event to use to determine a "press".
     * - `pointerdown` is eager on both mouse + touch input.
     * - `mousedown` is eager on mouse input, but lazy on touch input.
     * - `click` is lazy on both mouse + touch input.
     * @default 'pointerdown'
     */
    referencePressEvent?: 'pointerdown' | 'mousedown' | 'click'
    /**
     * Whether to dismiss the floating element upon pressing outside of the
     * floating element.
     * If you have another element, like a toast, that is rendered outside the
     * floating element's React tree and don't want the floating element to close
     * when pressing it, you can guard the check like so:
     * ```jsx
     * useDismiss(context, {
     *   outsidePress: (event) => !event.target.closest('.toast'),
     * });
     * ```
     * @default true
     */
    outsidePress?: boolean | ((event: MouseEvent) => boolean)
    /**
     * The type of event to use to determine an outside "press".
     * - `pointerdown` is eager on both mouse + touch input.
     * - `mousedown` is eager on mouse input, but lazy on touch input.
     * - `click` is lazy on both mouse + touch input.
     * @default 'pointerdown'
     */
    outsidePressEvent?: 'pointerdown' | 'mousedown' | 'click'
    /**
     * Whether to dismiss the floating element upon scrolling an overflow
     * ancestor.
     * @default false
     */
    ancestorScroll?: boolean
    /**
     * Determines whether event listeners bubble upwards through a tree of
     * floating elements.
     */
    bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean }
    /**
     * Determines whether to use capture phase event listeners.
     */
    capture?: boolean | { escapeKey?: boolean; outsidePress?: boolean }
}

/**
 * Closes the floating element when a dismissal is requested — by default, when
 * the user presses the `escape` key or outside of the floating element.
 * @see https://floating-ui.com/docs/useDismiss
 */
export function useDismiss<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseDismissProps = {},
): ElementProps {
    const {
        enabled = true,
        escapeKey = true,
        outsidePress: unstable_outsidePress = true,
        outsidePressEvent = 'pointerdown',
        referencePress = false,
        referencePressEvent = 'pointerdown',
        ancestorScroll = false,
        bubbles,
        capture,
    } = props

    const { open, reference: contextReference, floating: contextFloating, reason } = context

    const outsidePressFn = typeof unstable_outsidePress === 'function'
        ? unstable_outsidePress
        : () => false

    const outsidePress =
        typeof unstable_outsidePress === 'function'
            ? outsidePressFn
            : unstable_outsidePress

    const endedOrStartedInsideRef = $<boolean>(false)
    const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
        normalizeProp(bubbles)
    const { escapeKey: escapeKeyCapture, outsidePress: outsidePressCapture } =
        normalizeProp(capture)

    const isComposingRef = $<boolean>(false)
    const blurTimeoutRef = $<number>(-1)

    const closeOnEscapeKeyDown = (event: KeyboardEvent) => {
        if (!context || !$$(open) || !enabled || !escapeKey || event.key !== 'Escape') {
            return
        }

        // Wait until IME is settled. Pressing `Escape` while composing should
        // close the compose menu, but not the floating element.
        if ($$(isComposingRef)) {
            return
        }

        if (!escapeKeyBubbles) {
            event.stopPropagation()
        }

        batch(() => {
            open(false)
            reason('escape-key')
        })
    }

    const closeOnPressOutside = (event: MouseEvent) => {
        // Given developers can stop the propagation of the synthetic event,
        // we can only be confident with a positive value.
        // insideReactTree is not used in Woby implementation

        // When click outside is lazy (`click` event), handle dragging.
        // Don't close if:
        // - The click started inside the floating element.
        // - The click ended inside the floating element.
        const endedOrStartedInside = $$(endedOrStartedInsideRef)
        endedOrStartedInsideRef(false)

        const target = event.target as Element | null
        const inertSelector = `[data-floating-ui-inert]`
        const markers = getDocument($$(contextFloating)).querySelectorAll(
            inertSelector,
        )

        let targetRootAncestor = isElement(target) ? target : null
        while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
            const nextParent = getParentNode(targetRootAncestor)
            if (isLastTraversableNode(nextParent) || !isElement(nextParent)) {
                break
            }

            targetRootAncestor = nextParent
        }

        // Check if the click occurred on a third-party element injected after the
        // floating element rendered.
        if (
            markers.length &&
            isElement(target) &&
            // Clicked on a direct ancestor (e.g. FloatingOverlay).
            !contains(target, $$(contextFloating)) &&
            // If the target root element contains none of the markers, then the
            // element was injected after the floating element rendered.
            Array.from(markers).every(
                (marker) => !contains(targetRootAncestor, marker),
            )
        ) {
            return
        }

        // Check if the click occurred on the scrollbar
        if (isHTMLElement(target) && $$(contextFloating)) {
            const lastTraversableNode = isLastTraversableNode(target)
            const style = getComputedStyle(target)
            const scrollRe = /auto|scroll/
            const isScrollableX =
                lastTraversableNode || scrollRe.test(style.overflowX)
            const isScrollableY =
                lastTraversableNode || scrollRe.test(style.overflowY)

            const canScrollX =
                isScrollableX &&
                target.clientWidth > 0 &&
                target.scrollWidth > target.clientWidth
            const canScrollY =
                isScrollableY &&
                target.clientHeight > 0 &&
                target.scrollHeight > target.clientHeight

            const isRTL = style.direction === 'rtl'

            // Check click position relative to scrollbar.
            // In some browsers it is possible to change the <body> (or window)
            // scrollbar to the left side, but is very rare and is difficult to
            // check for. Plus, for modal dialogs with backdrops, it is more
            // important that the backdrop is checked but not so much the window.
            const pressedVerticalScrollbar =
                canScrollY &&
                (isRTL
                    ? event.offsetX <= target.offsetWidth - target.clientWidth
                    : event.offsetX > target.clientWidth)

            const pressedHorizontalScrollbar =
                canScrollX && event.offsetY > target.clientHeight

            if (pressedVerticalScrollbar || pressedHorizontalScrollbar) {
                return
            }
        }

        if (
            isEventTargetWithin(event, $$(contextFloating)) ||
            isEventTargetWithin(event, $$(contextReference) as Element)
        ) {
            return
        }

        batch(() => {
            open(false)
            reason('outside-press')
        })
    }

    const getTarget = (event: Event): EventTarget | null => {
        return event.target
    }

    const getDocument = (node: Element | null): Document => {
        return node?.ownerDocument || document
    }

    const contains = (parent: Element | null, child: Element | null): boolean => {
        if (!parent || !child) return false
        return parent === child || parent.contains(child)
    }

    const isEventTargetWithin = (event: Event, element: Element | null): boolean => {
        const target = getTarget(event)
        return element && target ? contains(element, target as Element) : false
    }

    const isWebKit = (): boolean => {
        return typeof navigator !== 'undefined' && /apple/i.test(navigator.vendor)
    }

    // Setup event listeners using useEffect to ensure proper cleanup
    useEffect(() => {
        if (!enabled || !$$(open)) return

        const doc = getDocument($$(contextFloating))
        const removeEventListeners: Array<() => void> = []

        if (escapeKey) {
            const escapeHandler = (event: KeyboardEvent) => closeOnEscapeKeyDown(event)
            doc.addEventListener('keydown', escapeHandler, escapeKeyCapture)
            removeEventListeners.push(() => doc.removeEventListener('keydown', escapeHandler, escapeKeyCapture))
        }

        if (outsidePress) {
            const outsidePressHandler = (event: MouseEvent) => closeOnPressOutside(event)
            doc.addEventListener(outsidePressEvent, outsidePressHandler, outsidePressCapture)
            removeEventListeners.push(() => doc.removeEventListener(outsidePressEvent, outsidePressHandler, outsidePressCapture))
        }

        let ancestors: (Element | Window | VisualViewport)[] = []

        if (ancestorScroll) {
            if (isElement($$(contextReference) as Element)) {
                ancestors = getOverflowAncestors($$(contextReference) as Element)
            }

            if ($$(contextFloating)) {
                ancestors = ancestors.concat(getOverflowAncestors($$(contextFloating) as Element))
            }

            if (
                !isElement($$(contextReference) as Element) &&
                $$(contextReference) &&
                ($$(contextReference) as any).contextElement
            ) {
                ancestors = ancestors.concat(
                    getOverflowAncestors(($$(contextReference) as any).contextElement),
                )
            }
        }

        // Ignore the visual viewport for scrolling dismissal (allow pinch-zoom)
        ancestors = ancestors.filter(
            (ancestor) => ancestor !== doc.defaultView?.visualViewport,
        )

        const scrollListeners: Array<() => void> = []
        ancestors.forEach((ancestor) => {
            const scrollHandler = () => {
                batch(() => {
                    open(false)
                    reason('ancestor-scroll')
                })
            }
            ancestor.addEventListener('scroll', scrollHandler)
            const removeScrollListener = () => ancestor.removeEventListener('scroll', scrollHandler)
            scrollListeners.push(removeScrollListener)
            removeEventListeners.push(removeScrollListener)
        })

        // Return dispose function to clean up all event listeners
        return () => {
            removeEventListeners.forEach(remove => remove())
        }
    })

    const referenceProps: ElementProps['reference'] = {
        // Remove references to insideReactTree since it doesn't exist in Woby
    }

    const floatingProps: ElementProps['floating'] = {
        onKeyDown: closeOnEscapeKeyDown,
        onMouseDown() {
            // In Woby, we don't need to track insideReactTree
        },
    }

    return enabled ? { reference: referenceProps, floating: floatingProps } : {}
}

function clearTimeoutIfSet(timeoutRef: Observable<number>) {
    const timeout = $$(timeoutRef)
    if (timeout > 0) {
        clearTimeout(timeout)
        timeoutRef(-1)
    }
}