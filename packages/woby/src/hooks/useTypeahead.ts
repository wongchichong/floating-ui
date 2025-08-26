import { $, $$, type ObservableMaybe, Observable } from 'woby'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'

export interface UseTypeaheadProps {
    /**
     * A ref which contains an array of strings whose indices match the HTML
     * elements of the list.
     * @default empty list
     */
    listRef: Array<string | null>
    /**
     * The index of the active (focused or highlighted) item in the list.
     * @default null
     */
    activeIndex: number | null
    /**
     * Callback invoked with the matching index if found as the user types.
     */
    onMatch?: (index: number) => void
    /**
     * Callback invoked with the typing state as the user types.
     */
    onTypingChange?: (isTyping: boolean) => void
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * A function that returns the matching string from the list.
     * @default lowercase-finder
     */
    findMatch?:
    | null
    | ((
        list: Array<string | null>,
        typedString: string,
    ) => string | null | undefined)
    /**
     * The number of milliseconds to wait before resetting the typed string.
     * @default 750
     */
    resetMs?: number
    /**
     * An array of keys to ignore when typing.
     * @default []
     */
    ignoreKeys?: Array<string>
    /**
     * The index of the selected item in the list, if available.
     * @default null
     */
    selectedIndex?: number | null
}

/**
 * Provides a matching callback that can be used to focus an item as the user
 * types, often used in tandem with `useListNavigation()`.
 * @see https://floating-ui.com/docs/useTypeahead
 */
export function useTypeahead<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseTypeaheadProps,
): ElementProps {
    const {
        listRef,
        activeIndex,
        onMatch: unstable_onMatch,
        onTypingChange: unstable_onTypingChange,
        enabled = true,
        findMatch = null,
        resetMs = 750,
        ignoreKeys = [],
        selectedIndex = null,
    } = props

    const { open, reason } = context

    const timeoutIdRef = $<number>(-1)
    const stringRef = $<string>('')
    const prevIndexRef = $<number | null>(
        selectedIndex ?? activeIndex ?? -1,
    )
    const matchIndexRef = $<number | null>(null)

    const onMatch = (index: number) => {
        if (unstable_onMatch) {
            unstable_onMatch(index)
        }
    }

    const onTypingChange = (value: boolean) => {
        if (unstable_onTypingChange) {
            unstable_onTypingChange(value)
        }
    }

    const setTypingChange = (value: boolean) => {
        // Simplified for Woby - no dataRef.typing
        onTypingChange(value)
    }

    const getMatchingIndex = (
        list: Array<string | null>,
        orderedList: Array<string | null>,
        string: string,
    ) => {
        const str = findMatch
            ? findMatch(orderedList, string)
            : orderedList.find(
                (text) =>
                    text?.toLocaleLowerCase().indexOf(string.toLocaleLowerCase()) ===
                    0,
            )

        return str ? list.indexOf(str) : -1
    }

    const onKeyDown = (event: KeyboardEvent) => {
        const listContent = listRef

        if ($$(stringRef).length > 0 && $$(stringRef)[0] !== ' ') {
            if (
                getMatchingIndex(listContent, listContent, $$(stringRef)) === -1
            ) {
                setTypingChange(false)
            } else if (event.key === ' ') {
                event.preventDefault()
            }
        }

        if (
            listContent == null ||
            ignoreKeys.includes(event.key) ||
            // Character key.
            event.key.length !== 1 ||
            // Modifier key.
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
        ) {
            return
        }

        if (($$(open) && event.key !== ' ')) {
            event.preventDefault()
            setTypingChange(true)
        }

        // Bail out if the list contains a word like "llama" or "aaron". TODO:
        // allow it in this case, too.
        const allowRapidSuccessionOfFirstLetter = listContent.every((text) =>
            text
                ? text[0]?.toLocaleLowerCase() !== text[1]?.toLocaleLowerCase()
                : true,
        )

        // Allows the user to cycle through items that start with the same letter
        // in rapid succession.
        if (allowRapidSuccessionOfFirstLetter && $$(stringRef) === event.key) {
            stringRef('')
            prevIndexRef($$(matchIndexRef))
        }

        stringRef($$(stringRef) + event.key)
        clearTimeoutIfSet(timeoutIdRef)
        timeoutIdRef(window.setTimeout(() => {
            stringRef('')
            prevIndexRef($$(matchIndexRef))
            setTypingChange(false)
        }, resetMs))

        const prevIndex = $$(prevIndexRef)

        const index = getMatchingIndex(
            listContent,
            [
                ...listContent.slice((prevIndex || 0) + 1),
                ...listContent.slice(0, (prevIndex || 0) + 1),
            ],
            $$(stringRef),
        )

        if (index !== -1) {
            onMatch(index)
            matchIndexRef(index)
        } else if (event.key !== ' ') {
            stringRef('')
            setTypingChange(false)
        }
    }

    const reference: ElementProps['reference'] = {
        onKeyDown,
    }

    const floating: ElementProps['floating'] = {
        onKeyDown,
        onKeyUp(event: KeyboardEvent) {
            if (event.key === ' ') {
                setTypingChange(false)
            }
        },
    }

    return enabled ? { reference, floating } : {}
}

function clearTimeoutIfSet(timeoutRef: Observable<number>) {
    const timeout = $$(timeoutRef)
    if (timeout > 0) {
        clearTimeout(timeout)
        timeoutRef(-1)
    }
}