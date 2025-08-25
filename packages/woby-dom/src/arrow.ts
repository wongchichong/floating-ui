import type { Derivable, Middleware, Padding } from '@floating-ui/dom'
import { arrow as arrowCore } from '@floating-ui/dom'
import type { Observable } from 'woby'
import { $$ } from 'woby'

export interface ArrowOptions {
    /**
     * The arrow element to be positioned.
     * @default undefined
     */
    element: Observable<Element | null> | Element | null
    /**
     * The padding between the arrow element and the floating element edges.
     * Useful when the floating element has rounded corners.
     * @default 0
     */
    padding?: Padding
}

/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * This wraps the core `arrow` middleware to allow Woby refs as the element.
 * @see https://floating-ui.com/docs/arrow
 */
export const arrow = (
    options: ArrowOptions | Derivable<ArrowOptions>,
): Middleware => {
    function isRef(value: unknown): value is Observable<unknown> {
        return typeof value === 'function' && 'valueOf' in value
    }

    return {
        name: 'arrow',
        options,
        fn(state) {
            const { element, padding } =
                typeof options === 'function' ? options(state) : options

            if (element && isRef(element)) {
                const elementValue = $$(element)
                if (elementValue != null) {
                    return arrowCore({ element: elementValue as Element, padding }).fn(state)
                }

                return {}
            }

            if (element) {
                return arrowCore({ element: element as Element, padding }).fn(state)
            }

            return {}
        },
    }
}