import type { Observable, ObservableMaybe } from 'woby'
import type {
    ComputePositionReturn,
    VirtualElement
} from '@floating-ui/dom'

// Re-export essential types from woby-dom
export type {
    AlignedPlacement,
    Alignment,
    ArrowOptions,
    AutoPlacementOptions,
    AutoUpdateOptions,
    Axis,
    Boundary,
    ClientRectObject,
    ComputePositionConfig,
    Coords,
    DetectOverflowOptions,
    Dimensions,
    ElementContext,
    ElementRects,
    Elements,
    FlipOptions,
    FloatingElement,
    HideOptions,
    InlineOptions,
    Length,
    Middleware,
    MiddlewareArguments,
    MiddlewareData,
    MiddlewareReturn,
    MiddlewareState,
    NodeScroll,
    OffsetOptions,
    Padding,
    Placement,
    Platform,
    Rect,
    ReferenceElement,
    RootBoundary,
    ShiftOptions,
    Side,
    SideObject,
    SizeOptions,
    Strategy,
} from '@floating-ui/woby-dom'

export {
    arrow,
    autoPlacement,
    autoUpdate,
    computePosition,
    detectOverflow,
    flip,
    getOverflowAncestors,
    hide,
    inline,
    limitShift,
    offset,
    platform,
    shift,
    size,
} from '@floating-ui/woby-dom'

type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type OpenChangeReason =
    | 'outside-press'
    | 'escape-key'
    | 'ancestor-scroll'
    | 'reference-press'
    | 'click'
    | 'hover'
    | 'focus'
    | 'focus-out'
    | 'list-navigation'
    | 'safe-polygon'

export type Delay = number | Partial<{ open: number; close: number }>

export type NarrowedElement<T> = T extends Element ? T : Element

export interface ExtendedRefs<RT extends ReferenceType> {
    position: UseFloatingReturn<RT>
    // Removed positionReference as it's not used by any external consumers
}

export interface ExtendedElements<RT> {
    reference: ObservableMaybe<RT | null>
    floating: ObservableMaybe<HTMLElement | null>
    // Removed domReference as it's redundant with reference
}

export interface FloatingEvents {
    emit<T extends string>(event: T, data?: any): void
    on(event: string, handler: (data: any) => void): void
    off(event: string, handler: (data: any) => void): void
}

export interface ContextData {
    openEvent?: Event
    floatingContext?: FloatingContext
    /** @deprecated use `onTypingChange` prop in `useTypeahead` */
    typing?: boolean
    [key: string]: any
}

// Removed FloatingRootContext interface since useFloatingRootContext hook has been eliminated

export type FloatingContext<RT extends ReferenceType = ReferenceType> = {
    position: Omit<UseFloatingReturn<RT>, 'reference' | 'floating'>
    open: ObservableMaybe<boolean>
    onOpenChange(open: boolean, event?: Event, reason?: OpenChangeReason): void
    events: FloatingEvents
    dataRef: Observable<ContextData>
    nodeId: string | undefined
    refs: ExtendedRefs<RT>
    reference: ObservableMaybe<RT | null>
    floating: ObservableMaybe<HTMLElement | null>
}

export interface FloatingNodeType<RT extends ReferenceType = ReferenceType> {
    id: string | undefined
    parentId: string | null
    context?: FloatingContext<RT>
}

export interface FloatingTreeType<RT extends ReferenceType = ReferenceType> {
    nodesRef: Observable<Array<FloatingNodeType<RT>>>
    events: FloatingEvents
    addNode(node: FloatingNodeType): void
    removeNode(node: FloatingNodeType): void
}

export interface ElementProps {
    reference?: any
    floating?: any
    item?: any | ((props: any) => any)
}

export type ReferenceType = Element | VirtualElement

export type UseFloatingData = Prettify<
    ComputePositionReturn & { isPositioned: boolean; x: number; y: number }
>

export type UseFloatingReturn<RT extends ReferenceType = ReferenceType> =
    Prettify<
        {
            // Context properties (flattened)
            open: ObservableMaybe<boolean>
            onOpenChange: (open: boolean, event?: Event, reason?: OpenChangeReason) => void
            events: FloatingEvents
            reference: ObservableMaybe<RT | null>
            floating: ObservableMaybe<HTMLElement | null>

            // Removed separate position property and using intersection with woby-dom's UseFloatingReturn
            // This correctly represents the structure since we're spreading the position object
        } & import('@floating-ui/woby-dom').UseFloatingReturn<RT>
    >

export interface UseFloatingOptions<RT extends ReferenceType = ReferenceType>
    extends Omit<import('@floating-ui/woby-dom').UseFloatingOptions<RT>, 'elements' | 'reference' | 'floating'> {
    // Removed rootContext property since useFloatingRootContext hook has been eliminated
    /**
     * Externally passed reference element. Store in state.
     */
    reference: ObservableMaybe<RT | null>
    /**
     * Externally passed floating element. Store in state.
     */
    floating: ObservableMaybe<HTMLElement | null>
    /**
     * An event callback that is invoked when the floating element is opened or
     * closed.
     */
    onOpenChange?(open: boolean, event?: Event, reason?: OpenChangeReason): void
    /**
     * Unique node id when using `FloatingTree`.
     * Note: This property is not currently used in the woby implementation.
     */
    // nodeId?: string
}
