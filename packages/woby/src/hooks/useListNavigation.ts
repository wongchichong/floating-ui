import { $, $$, type ObservableMaybe, batch } from 'woby'
import { isHTMLElement } from '@floating-ui/utils/dom'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'
const ARROW_RIGHT = 'ArrowRight'
const ARROW_LEFT = 'ArrowLeft'
const ESCAPE = 'Escape'

function doSwitch(
    orientation: UseListNavigationProps['orientation'],
    vertical: boolean,
    horizontal: boolean,
) {
    switch (orientation) {
        case 'vertical':
            return vertical
        case 'horizontal':
            return horizontal
        default:
            return vertical || horizontal
    }
}

function isMainOrientationKey(
    key: string,
    orientation: UseListNavigationProps['orientation'],
) {
    const vertical = key === ARROW_UP || key === ARROW_DOWN
    const horizontal = key === ARROW_LEFT || key === ARROW_RIGHT
    return doSwitch(orientation, vertical, horizontal)
}

function isMainOrientationToEndKey(
    key: string,
    orientation: UseListNavigationProps['orientation'],
    rtl: boolean,
) {
    const vertical = key === ARROW_DOWN
    const horizontal = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT
    return (
        doSwitch(orientation, vertical, horizontal) ||
        key === 'Enter' ||
        key === ' ' ||
        key === ''
    )
}

function isCrossOrientationOpenKey(
    key: string,
    orientation: UseListNavigationProps['orientation'],
    rtl: boolean,
) {
    const vertical = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT
    const horizontal = key === ARROW_DOWN
    return doSwitch(orientation, vertical, horizontal)
}

function isCrossOrientationCloseKey(
    key: string,
    orientation: UseListNavigationProps['orientation'],
    rtl: boolean,
) {
    const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT
    const horizontal = key === ARROW_UP
    return doSwitch(orientation, vertical, horizontal)
}

export interface UseListNavigationProps {
    /**
     * A ref that holds an array of list items.
     * @default empty list
     */
    listRef: Array<HTMLElement | null>
    /**
     * The index of the currently active (focused or highlighted) item, which may
     * or may not be selected.
     * @default null
     */
    activeIndex: number | null
    /**
     * A callback that is called when the user navigates to a new active item,
     * passed in a new `activeIndex`.
     */
    onNavigate?: (activeIndex: number | null) => void
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * The currently selected item index, which may or may not be active.
     * @default null
     */
    selectedIndex?: number | null
    /**
     * Whether to focus the item upon opening the floating element. 'auto' infers
     * what to do based on the input type (keyboard vs. pointer), while a boolean
     * value will force the value.
     * @default 'auto'
     */
    focusItemOnOpen?: boolean | 'auto'
    /**
     * Whether hovering an item synchronizes the focus.
     * @default true
     */
    focusItemOnHover?: boolean
    /**
     * Whether pressing an arrow key on the navigation's main axis opens the
     * floating element.
     * @default true
     */
    openOnArrowKeyDown?: boolean
    /**
     * By default elements with either a `disabled` or `aria-disabled` attribute
     * are skipped in the list navigation — however, this requires the items to
     * be rendered.
     * This prop allows you to manually specify indices which should be disabled,
     * overriding the default logic.
     * For Windows-style select menus, where the menu does not open when
     * navigating via arrow keys, specify an empty array.
     * @default undefined
     */
    disabledIndices?: Array<number>
    /**
     * Determines whether focus can escape the list, such that nothing is selected
     * after navigating beyond the boundary of the list. In some
     * autocomplete/combobox components, this may be desired, as screen
     * readers will return to the input.
     * `loop` must be `true`.
     * @default false
     */
    allowEscape?: boolean
    /**
     * Determines whether focus should loop around when navigating past the first
     * or last item.
     * @default false
     */
    loop?: boolean
    /**
     * If the list is nested within another one (e.g. a nested submenu), the
     * navigation semantics change.
     * @default false
     */
    nested?: boolean
    /**
     * Whether the direction of the floating element's navigation is in RTL
     * layout.
     * @default false
     */
    rtl?: boolean
    /**
     * The orientation in which navigation occurs.
     * @default 'vertical'
     */
    orientation?: 'vertical' | 'horizontal' | 'both'
}

/**
 * Provides navigation for list items, with optional typeahead functionality.
 * @see https://floating-ui.com/docs/useListNavigation
 */
export function useListNavigation<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseListNavigationProps,
): ElementProps {
    const {
        listRef,
        activeIndex,
        onNavigate,
        enabled = true,
        selectedIndex = null,
        focusItemOnOpen = 'auto',
        focusItemOnHover = true,
        openOnArrowKeyDown = true,
        disabledIndices = [],
        allowEscape = false,
        loop = false,
        nested = false,
        rtl = false,
        orientation = 'vertical',
    } = props

    const { open, reason } = context

    const parentId = null // Simplified for now
    const tree = null // Simplified for now

    const isNested = parentId != null

    const isTypeableCombobox = () => false // Simplified for now

    const isVirtualClick = () => false // Simplified for now

    const isVirtualPointerEvent = () => false // Simplified for now

    const isMainOrientationToEndKeyRef = (key: string) => isMainOrientationToEndKey(key, orientation, rtl)

    const isCrossOrientationOpenKeyRef = (key: string) => isCrossOrientationOpenKey(key, orientation, rtl)

    const isCrossOrientationCloseKeyRef = (key: string) => isCrossOrientationCloseKey(key, orientation, rtl)

    const reference: ElementProps['reference'] = {
        onPointerDown() {
            // Implementation would go here
        },
        onKeyDown(event: KeyboardEvent) {
            if (!enabled) return

            const { key } = event

            if (focusItemOnOpen === 'auto' && isMainOrientationKey(key, orientation)) {
                if ($$(open)) {
                    event.preventDefault()
                }

                if (!$$(open) && openOnArrowKeyDown) {
                    batch(() => {
                        open(true)
                        reason('list-navigation')
                    })
                }
            }

            if (isCrossOrientationOpenKeyRef(key)) {
                if (!$$(open)) {
                    batch(() => {
                        open(true)
                        reason('list-navigation')
                    })
                }
            }
        },
    }

    const floating: ElementProps['floating'] = {
        onKeyDown(event: KeyboardEvent) {
            if (!enabled) return

            const { key } = event

            if ($$(open) && listRef) {
                const items = listRef.filter((item) => item != null) as HTMLElement[]

                if (items.length === 0) return

                const index = activeIndex ?? -1

                if (key === ARROW_DOWN) {
                    event.preventDefault()
                    const nextIndex = index === items.length - 1 ? (loop ? 0 : index) : index + 1
                    onNavigate?.(nextIndex)
                } else if (key === ARROW_UP) {
                    event.preventDefault()
                    const prevIndex = index <= 0 ? (loop ? items.length - 1 : 0) : index - 1
                    onNavigate?.(prevIndex)
                } else if (key === ESCAPE) {
                    batch(() => {
                        open(false)
                        reason('escape-key')
                    })
                }
            }
        },
    }

    const item: ElementProps['item'] = ({ active, selected }) => {
        return {
            role: 'option',
            ...(active && { 'aria-selected': active && selected }),
        }
    }

    return enabled ? { reference, floating, item } : {}
}