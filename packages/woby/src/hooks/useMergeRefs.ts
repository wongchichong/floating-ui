import { ObservableMaybe, isObservable } from 'woby'

/**
 * Merges an array of refs into a single memoized callback ref or `null`.
 * @see https://floating-ui.com/docs/react-utils#usemergerefs
 */
export function useMergeRefs<Instance>(
    refs: Array<ObservableMaybe<Instance | null> | undefined>,
): null | ((value: Instance | null) => void) {
    if (refs.every((ref) => ref == null)) {
        return null
    }

    return (value) => {
        refs.forEach((ref) => {
            if (ref) {
                if (isObservable(ref)) {
                    // For observables, we need to call the setter function
                    ref(value)
                } else if (typeof ref === 'function') {
                    ref(value)
                }
            }
        })
    }
}