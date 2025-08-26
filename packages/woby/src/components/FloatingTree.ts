import { $, $$, useEffect, type ObservableMaybe } from 'woby'

import { useId } from '../hooks/useId'
import type { FloatingNodeType, FloatingTreeType, ReferenceType } from '../types'
import { createEventEmitter } from '../utils/createEventEmitter'

// Context for floating node
const FloatingNodeContext = $<FloatingNodeType | null>(null)

// Context for floating tree
const FloatingTreeContext = $<FloatingTreeType | null>(null)

/**
 * Returns the parent node id for nested floating elements, if available.
 * Returns `null` for top-level floating elements.
 */
export function useFloatingParentNodeId(): string | null {
    const node = $$(FloatingNodeContext)
    return node?.id || null
}

/**
 * Returns the nearest floating tree context, if available.
 */
export function useFloatingTree<
    RT extends ReferenceType = ReferenceType,
>(): FloatingTreeType<RT> | null {
    return $$(FloatingTreeContext) as FloatingTreeType<RT> | null
}

/**
 * Registers a node into the `FloatingTree`, returning its id.
 * @see https://floating-ui.com/docs/FloatingTree
 */
export function useFloatingNodeId(customParentId?: string): string | undefined {
    const id = useId()
    const tree = useFloatingTree()
    const reactParentId = useFloatingParentNodeId()
    const parentId = customParentId || reactParentId

    useEffect(() => {
        if (!id) return
        const node = { id, parentId }
        tree?.addNode(node)
        return () => {
            tree?.removeNode(node)
        }
    })

    return id
}

export interface FloatingNodeProps {
    children?: any
    id: string | undefined
}

/**
 * Provides parent node context for nested floating elements.
 * @see https://floating-ui.com/docs/FloatingTree
 */
export function FloatingNode(props: FloatingNodeProps) {
    const { children, id } = props

    const parentId = useFloatingParentNodeId()

    // Set the context value
    const nodeValue = { id, parentId }
    FloatingNodeContext(nodeValue)

    return children
}

export interface FloatingTreeProps {
    children?: any
}

/**
 * Provides context for nested floating elements when they are not children of
 * each other on the DOM.
 * This is not necessary in all cases, except when there must be explicit communication between parent and child floating elements. It is necessary for:
 * - The `bubbles` option in the `useDismiss()` Hook
 * - Nested virtual list navigation
 * - Nested floating elements that each open on hover
 * - Custom communication between parent and child floating elements
 * @see https://floating-ui.com/docs/FloatingTree
 */
export function FloatingTree(props: FloatingTreeProps) {
    const { children } = props

    const nodesRef = $<Array<FloatingNodeType>>([])

    const addNode = (node: FloatingNodeType) => {
        nodesRef([...$$(nodesRef), node])
    }

    const removeNode = (node: FloatingNodeType) => {
        nodesRef($$(nodesRef).filter((n) => n !== node))
    }

    const events = createEventEmitter()

    // Set the context value
    const treeValue = {
        nodesRef,
        addNode,
        removeNode,
        events,
    }
    FloatingTreeContext(treeValue)

    return children
}