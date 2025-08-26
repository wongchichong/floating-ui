import type { Observable, ObservableMaybe } from 'woby'
import type {
    ComputePositionReturn,
    VirtualElement,
    Strategy,
    Placement,
    MiddlewareData,
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
    ComputePositionReturn,
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
} from '@floating-ui/dom'

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
} from '@floating-ui/dom'

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
    open: Observable<boolean>
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
    reference?: Record<string, any>
    floating?: Record<string, any>
    item?: Record<string, any> | ((props: Record<string, any>) => Record<string, any>)
}

export type ReferenceType = Element | VirtualElement

export type UseFloatingData = Prettify<
    ComputePositionReturn & { isPositioned: boolean; x: number; y: number }
>

export type UseFloatingReturn<RT extends ReferenceType = ReferenceType> =
    Prettify<
        {
            // Flattened data properties from woby-dom
            x: Observable<number>
            y: Observable<number>
            strategy: Observable<Strategy>
            placement: Observable<Placement>
            middlewareData: Observable<MiddlewareData>
            isPositioned: Observable<boolean>

            // Woby-specific properties
            open: Observable<boolean>
            reason: Observable<OpenChangeReason | null>
            events: FloatingEvents
            reference: Observable<RT | null>
            floating: Observable<HTMLElement | null>

            /**
             * Update the position of the floating element, re-rendering the component
             * if required.
             */
            update: () => void
            /**
             * Pre-configured positioning styles observable to apply to the floating element.
             */
            floatingStyles: Observable<Record<string, any>>
        }
    >

export interface UseFloatingOptions<RT extends ReferenceType = ReferenceType>
    extends Omit<import('@floating-ui/dom').ComputePositionConfig, 'elements' | 'reference' | 'floating'> {
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
     * The `open` state of the floating element to synchronize with the
     * `isPositioned` value.
     * @default false
     */
    open?: ObservableMaybe<boolean>
    /**
     * Whether to use `transform` for positioning instead of `top` and `left`
     * (layout) in the `floatingStyles` object.
     * @default true
     */
    transform?: boolean
    /**
     * Unique node id when using `FloatingTree`.
     * Note: This property is not currently used in the woby implementation.
     */
    // nodeId?: string
}