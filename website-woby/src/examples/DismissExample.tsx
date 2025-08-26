import { $, $$ } from 'woby'
import { useFloating, useDismiss, useInteractions, offset, flip, shift, useClick } from '@floating-ui/woby'

export function DismissExample() {
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

    // Add dismiss interaction
    const click = useClick(floating)

    const dismiss = useDismiss(floating, {
        outsidePressEvent: 'mousedown',
        escapeKey: true,
    }) //just hook will do

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([click/* , dismiss *//* not neccessary here */])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Click to toggle popover
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
                    <div className="p-4">
                        <h3 className="font-bold mb-2">Dismiss Example</h3>
                        <p className="mb-2">This popover can be dismissed by:</p>
                        <ul className="list-disc pl-5 mb-2">
                            <li>Clicking outside</li>
                            <li>Pressing Escape key</li>
                        </ul>
                        <p>Try it out!</p>
                    </div>
                </div>
            )}
        </div>
    )
}