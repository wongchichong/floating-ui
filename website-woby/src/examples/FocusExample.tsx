import { $, $$ } from 'woby'
import { useFloating, useFocus, useInteractions, offset, flip, shift, useHover } from '@floating-ui/woby'

export function FocusExample() {
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

    // Add focus interaction
    const focus = useFocus(floating, {
        visibleOnly: true,
    })

    // const hover = useHover(floating, {
    //     move: true,
    //     delay: { open: 100, close: 200 },
    // })

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([focus])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors"
                tabIndex={0}
            >
                Focus me (Tab key)
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
                    I appear when you focus the button!
                </div>
            )}
        </div>
    )
}