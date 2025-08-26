import { $, $$ } from 'woby'
import { useFloating, useHover, useInteractions, offset, flip, shift } from '@floating-ui/woby'

export function HoverExample() {
    const isOpen = $(false)
    const referenceRef = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)

    // Initialize the floating element with positioning
    const floating = useFloating({
        open: isOpen,
        middleware: [offset(10), flip(), shift()],
        reference: referenceRef,
        floating: floatingRef,
    })

    // Add hover interaction
    const hover = useHover(floating, {
        move: true,
        delay: { open: 100, close: 200 },
    })

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([hover])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Hover over me
            </button>

            {() => $$(isOpen) && (
                <div
                    ref={floatingRef}
                    style={() => ({
                        ...$$(floating.floatingStyles),
                        zIndex: 1000,
                    })}
                    {...getFloatingProps()}
                    className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
                >
                    I appear when you hover over the button!
                </div>
            )}
        </div>
    )
}