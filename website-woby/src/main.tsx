import { render } from 'woby'
import { $, $$, useEffect } from 'woby'
import { useFloating, offset, flip, shift } from '@floating-ui/woby'
import './assets/global.css'

function App() {
    const open = $(false)
    const referenceRef = $<Element | null>(null)
    const floatingRef = $<HTMLElement | null>(null)

    const floating = useFloating({
        open: open,
        placement: 'bottom',
        middleware: [offset(10), flip(), shift()],
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

                <div className="text-center mt-8">
                    <p className="text-gray-500">
                        This is a basic implementation of Floating UI for Woby.
                    </p>
                </div>
            </div>
        </div >
    )
}

render(<App />, document.getElementById('root')!)