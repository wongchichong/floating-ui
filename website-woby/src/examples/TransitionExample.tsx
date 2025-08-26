import { $, $$ } from 'woby'
import { useFloating, useTransitionStyles, useInteractions, offset, flip, shift, useClick } from '@floating-ui/woby'

export function TransitionExample() {
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

    // Add transition styles
    const { styles } = useTransitionStyles(floating, {
        duration: 300,
        initial: {
            opacity: 0,
            transform: 'scale(0.8)',
        },
        open: {
            opacity: 1,
            transform: 'scale(1)',
        },
        close: {
            opacity: 0,
            transform: 'scale(0.8)',
        },
    })

    const click = useClick(floating)

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([click])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                onClick={() => isOpen(!$$(isOpen))}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Toggle with transition
            </button>

            {() => $$(isOpen) && (
                <div
                    ref={floatingRef}
                    style={() => ({
                        ...$$(floating.floatingStyles),
                        ...$$(styles),
                        zIndex: 1000,
                    })}
                    {...getFloatingProps()}
                    className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
                >
                    I have a smooth transition!
                </div>
            )}
        </div>
    )
}