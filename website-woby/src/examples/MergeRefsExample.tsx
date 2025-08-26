import { $, $$ } from 'woby'
import { useFloating, useInteractions, useMergeRefs, offset, flip, shift } from '@floating-ui/woby'

export function MergeRefsExample() {
    const isOpen = $(false)
    const referenceRef1 = $<Element | null>(null)
    const referenceRef2 = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)

    // Initialize the floating element with positioning
    const floating = useFloating({
        open: isOpen,
        middleware: [offset(10), flip(), shift()],
        reference: referenceRef1, // Using ref1 as the primary reference
        floating: floatingRef,
    })

    // Merge multiple refs for the reference element
    const mergedReferenceRef = useMergeRefs([referenceRef1, referenceRef2])

    // Simple interaction to toggle tooltip
    const toggle = () => isOpen(!$$(isOpen))

    return (
        <div className="flex justify-center">
            <button
                ref={mergedReferenceRef}
                onClick={toggle}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Click me (merged refs)
            </button>

            {() => $$(isOpen) && (
                <div
                    ref={floatingRef}
                    style={() => ({
                        ...$$(floating.floatingStyles),
                        zIndex: 1000,
                    })}
                    className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
                >
                    I'm controlled by a button with merged refs!
                </div>
            )}
        </div>
    )
}