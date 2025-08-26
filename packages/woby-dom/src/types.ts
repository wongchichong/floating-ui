import type {
    ComputePositionConfig,
    ComputePositionReturn,
    VirtualElement,
    Strategy,
    Placement,
    MiddlewareData,
} from '@floating-ui/dom'
import type { Observable, ObservableMaybe } from 'woby'

// Define OpenChangeReason locally instead of importing it
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

export type { ArrowOptions } from './arrow'
export { arrow } from './arrow'

export type {
    AlignedPlacement,
    Alignment,
    AutoPlacementOptions,
    AutoUpdateOptions,
    Axis,
    Boundary,
    ClientRectObject,
    ComputePositionConfig,
    ComputePositionReturn,
    Coords,
    Derivable,
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
    VirtualElement,
} from '@floating-ui/dom'
export {
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

export type UseFloatingData = Prettify<
    ComputePositionReturn & { isPositioned: boolean; x: number; y: number }
>

export type ReferenceType = Element | VirtualElement

export type UseFloatingReturn<RT extends ReferenceType = ReferenceType> =
    Prettify<
        {
            // Flattened data properties
            x: Observable<number>
            y: Observable<number>
            strategy: Observable<Strategy>
            placement: Observable<Placement>
            middlewareData: Observable<MiddlewareData>
            isPositioned: Observable<boolean>
            open: Observable<boolean>
            reason: Observable<OpenChangeReason | null>

            /**
             * Update the position of the floating element, re-rendering the component
             * if required.
             */
            update: () => void
            /**
             * Pre-configured positioning styles observable to apply to the floating element.
             */
            floatingStyles: Observable<Record<string, any>>
            /**
             * A Woby ref to the reference element.
             */
            reference: Observable<RT | null | undefined>
            /**
             * A Woby ref to the floating element.
             */
            floating: Observable<HTMLElement | null | undefined>
        }
    >

export type UseFloatingOptions<RT extends ReferenceType = ReferenceType> =
    Prettify<
        Partial<ComputePositionConfig> & {
            /**
             * A callback invoked when both the reference and floating elements are
             * mounted, and cleaned up when either is unmounted. This is useful for
             * setting up event listeners (e.g. pass `autoUpdate`).
             */
            whileElementsMounted?: (
                reference: RT,
                floating: HTMLElement,
                update: () => void,
            ) => () => void
            /**
             * Externally passed reference element. Store in state.
             */
            reference?: ObservableMaybe<RT | null>
            /**
             * Externally passed floating element. Store in state.
             */
            floating?: ObservableMaybe<HTMLElement | null>
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
        }
    >