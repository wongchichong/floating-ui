import { $, $$ } from 'woby'
import { useFloating, useListNavigation, useTypeahead, useInteractions, offset, flip, shift } from '@floating-ui/woby'

export function TypeaheadExample() {
    const isOpen = $(false)
    const referenceRef = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)
    const activeIndex = $(-1)

    // Create list items
    const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape']
    const listRef = items as Array<string | null>

    // Initialize the floating element with positioning
    const floating = useFloating({
        open: isOpen,
        middleware: [offset(10), flip(), shift()],
        reference: referenceRef,
        floating: floatingRef,
    })

    // Add list navigation interaction
    const listNavigation = useListNavigation(floating, {
        listRef: items.map(() => null) as Array<HTMLElement | null>,
        activeIndex: $$(activeIndex),
        onNavigate: (index) => activeIndex(index),
        loop: true,
        focusItemOnOpen: true,
    })

    // Add typeahead interaction
    const typeahead = useTypeahead(floating, {
        listRef,
        activeIndex: $$(activeIndex),
        onMatch: (index) => activeIndex(index),
        resetMs: 750,
    })

    // Merge all interactions
    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([listNavigation, typeahead])

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-xs">
                <label htmlFor="fruit-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Type to search fruits:
                </label>
                <button
                    id="fruit-select"
                    ref={referenceRef}
                    {...getReferenceProps()}
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    Select a fruit...
                </button>

                {() => $$(isOpen) && (
                    <div
                        ref={floatingRef}
                        style={() => ({
                            ...$$(floating.floatingStyles),
                            zIndex: 1000,
                        })}
                        {...getFloatingProps()}
                        className="bg-white rounded shadow-lg py-1 w-full mt-1"
                    >
                        {items.map((item, index) => (
                            <div
                                key={item}
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
        </div>
    )
}