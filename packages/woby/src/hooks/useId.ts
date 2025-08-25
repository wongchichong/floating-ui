import { $, $$ } from 'woby'

let serverHandoffComplete = false
let count = 0
const genId = () =>
    // Ensure the id is unique with multiple independent versions of Floating UI
    // on woby
    `floating-ui-${Math.random().toString(36).slice(2, 6)}${count++}`

function useFloatingId(): string | undefined {
    const id = $(serverHandoffComplete ? genId() : undefined)

    if (!$$(id)) {
        id(genId())
    }

    // Woby doesn't have server side rendering concerns in the same way
    serverHandoffComplete = true

    return $$(id)
}

/**
 * Generates a unique ID for floating elements.
 * @see https://floating-ui.com/docs/woby-utils#useid
 */
export const useId = useFloatingId