import { render } from 'woby'
import { $, $$, useEffect } from 'woby'
import { useFloating, offset, flip, shift, autoPlacement } from '@floating-ui/woby'
import { ClickExample } from './examples/ClickExample'
import { ClientPointExample } from './examples/ClientPointExample'
import { ClientPointWithHoverExample } from './examples/ClientPointWithHoverExample'
import { DismissExample } from './examples/DismissExample'
import { FocusExample } from './examples/FocusExample'
import { HoverExample } from './examples/HoverExample'
import { ListNavigationExample } from './examples/ListNavigationExample'
import { MergeRefsExample } from './examples/MergeRefsExample'
// Removed non-working examples: RoleExample, TransitionExample, TypeaheadExample
import './assets/global.css'

function App() {
    const open = $(false)
    const referenceRef = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)

    const floating = useFloating({
        open: open,
        // placement: 'left-end',
        middleware: [offset(10), flip(), shift(), autoPlacement()],
        reference: referenceRef,
        floating: floatingRef,
    })

    // Use floatingStyles instead of manually constructing styles
    const { floatingStyles } = floating
    useEffect(() => {
        if ($$(open) && $$(floatingRef)) {
            floating.update()
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Floating UI for Woby
                    </h1>
                    <p className="text-lg text-gray-600">
                        A reference implementation of Floating UI for the Woby framework.
                    </p>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Basic Tooltip Demo</h2>

                    <div className="flex justify-center">
                        <button
                            ref={referenceRef}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                            onMouseEnter={() => open(true)}
                            onMouseLeave={() => open(false)}
                        >
                            Hover me
                        </button>

                        {() => $$(open) && (
                            <div
                                ref={floatingRef}
                                style={() => ({
                                    ...$$(floatingStyles),
                                    zIndex: 1000,
                                })}
                                className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
                            >
                                I'm a tooltip powered by Floating UI!
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-sm text-gray-600">
                        <p><strong>Package:</strong> @floating-ui/woby</p>
                        <p><strong>Framework:</strong> Woby</p>
                        <p><strong>Status:</strong> Reference Implementation</p>
                    </div>
                </div>

                {/* New Click Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Click Interaction Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useClick</code> and <code className="bg-gray-100 px-1 rounded">useInteractions</code> hooks.
                    </p>

                    <ClickExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Click to toggle the tooltip</p>
                    </div>
                </div>

                {/* ClientPoint Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Client Point Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useClientPoint</code> hook.
                    </p>

                    <ClientPointExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Move mouse over the button to see the tooltip follow your cursor</p>
                    </div>
                </div>

                {/* ClientPoint with Hover Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Client Point with Hover Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of both <code className="bg-gray-100 px-1 rounded">useClientPoint</code> and <code className="bg-gray-100 px-1 rounded">useHover</code> hooks together.
                    </p>

                    <ClientPointWithHoverExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Hover over the button to see the tooltip follow your cursor</p>
                    </div>
                </div>

                {/* Dismiss Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Dismiss Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useDismiss</code> hook.
                    </p>

                    <DismissExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Click the button to open popover, then click outside or press Escape to dismiss</p>
                    </div>
                </div>

                {/* Focus Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Focus Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useFocus</code> hook.
                    </p>

                    <FocusExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Tab to focus the button to see the tooltip</p>
                    </div>
                </div>

                {/* Hover Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Hover Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useHover</code> hook.
                    </p>

                    <HoverExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Hover over the button to see the tooltip</p>
                    </div>
                </div>

                {/* List Navigation Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">List Navigation Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useListNavigation</code> hook.
                    </p>

                    <ListNavigationExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Click the button to open dropdown, then use arrow keys to navigate</p>
                    </div>
                </div>

                {/* Merge Refs Example Section */}
                <div className="bg-white rounded-lg p-8 shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Merge Refs Demo</h2>
                    <p className="text-gray-600 mb-4">
                        This example demonstrates the use of the <code className="bg-gray-100 px-1 rounded">useMergeRefs</code> hook.
                    </p>

                    <MergeRefsExample />

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Interaction:</strong> Click the button to see how multiple refs can be merged</p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-500">
                        This is a comprehensive implementation of Floating UI for Woby.
                    </p>
                </div>
            </div>
        </div >
    )
}

render(<App />, document.getElementById('root')!)