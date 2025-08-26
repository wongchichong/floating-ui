import { $, $$ } from 'woby'
import { useFloating, useClick, useInteractions, offset, flip, shift, useDismiss } from '@floating-ui/woby'

export function ClickExample() {
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

    // Add click interaction
    const click = useClick(floating)
    const dismiss = useDismiss(floating)

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([click/* , dismiss */])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Click me
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
                    I'm a click-controlled tooltip!
                </div>
            )}
        </div>
    )
}