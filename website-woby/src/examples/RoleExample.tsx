import { $, $$ } from 'woby'
import { useFloating, useRole, useInteractions, offset, flip, shift } from '@floating-ui/woby'

export function RoleExample() {
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

    // Add role for accessibility
    const role = useRole(floating, {
        role: 'tooltip',
    })

    // Merge all interactions
    const { getReferenceProps, getFloatingProps } = useInteractions([role])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Hover for tooltip
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
                    This is an accessible tooltip!
                </div>
            )}
        </div>
    )
}