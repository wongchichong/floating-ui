import { $, $$ } from 'woby'
import { useFloating, useListNavigation, useInteractions, useRole, offset, flip, shift, useHover, useClick, useDismiss } from '@floating-ui/woby'

export function ListNavigationExample() {
    const isOpen = $(false)
    const referenceRef = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)
    const activeIndex = $(0)

    // Create list items
    const items = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']
    const listRef = items.map(() => null) as Array<HTMLElement | null>

    // Initialize the floating element with positioning
    const floating = useFloating({
        open: isOpen,
        middleware: [offset(10), flip(), shift()],
        reference: referenceRef,
        floating: floatingRef,
    })

    // Add list navigation interaction
    const listNavigation = useListNavigation(floating, {
        listRef,
        activeIndex: $$(activeIndex),
        onNavigate: (index) => activeIndex(index),
        loop: true,
        focusItemOnOpen: true,
    })

    // Add role for accessibility
    const role = useRole(floating, {
        role: 'listbox',
    })

    const click = useClick(floating)
    useDismiss(floating)

    // Merge all interactions
    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, listNavigation, role])

    return (
        <div className="flex justify-center">
            <button
                ref={referenceRef}
                {...getReferenceProps()}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
                Click for dropdown
            </button>

            {() => $$(isOpen) && (
                <div
                    ref={floatingRef}
                    style={() => ({
                        ...$$(floating.floatingStyles),
                        zIndex: 1000,
                    })}
                    {...getFloatingProps()}
                    className="bg-white rounded shadow-lg py-1 w-48"
                >
                    {items.map((item, index) => (
                        <div
                            key={item}
                            ref={(el) => listRef[index] = el}
                            {...getItemProps({
                                active: index === $$(activeIndex),
                                selected: index === $$(activeIndex),
                            })}
                            className={`px-4 py-2 cursor-pointer ${index === $$(activeIndex)
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}