import { $, $$, type ObservableMaybe } from 'woby'
import type { ElementProps, UseFloatingReturn, ReferenceType } from '../types'
import { useId } from './useId'

type AriaRole =
    | 'tooltip'
    | 'dialog'
    | 'alertdialog'
    | 'menu'
    | 'listbox'
    | 'grid'
    | 'tree'
type ComponentRole = 'select' | 'label' | 'combobox'

const componentRoleToAriaRoleMap = new Map<ComponentRole, AriaRole | false>([
    ['select', 'listbox'],
    ['combobox', 'listbox'],
    ['label', false],
])

export interface UseRoleProps {
    /**
     * Whether the Hook is enabled, including all internal Effects and event
     * handlers.
     * @default true
     */
    enabled?: boolean
    /**
     * The role of the floating element.
     * @default 'dialog'
     */
    role?: AriaRole | ComponentRole
}

/**
 * Adds base screen reader props to the reference and floating elements for a
 * given floating element `role`.
 * @see https://floating-ui.com/docs/useRole
 */
export function useRole<RT extends ReferenceType = ReferenceType>(
    context: UseFloatingReturn<RT>,
    props: UseRoleProps = {},
): ElementProps {
    const { enabled = true, role = 'dialog' } = props

    const { open, reason } = context

    const referenceId = useId()
    const floatingId = useId()

    const ariaRole = (componentRoleToAriaRoleMap.get(role as ComponentRole) ?? role) as
        | AriaRole
        | false
        | undefined

    const parentId = null // Simplified for now
    const isNested = parentId != null

    const reference: ElementProps['reference'] = {
        ...(ariaRole === 'tooltip' || role === 'label'
            ? {
                [`aria-${role === 'label' ? 'labelledby' : 'describedby'}`]: floatingId,
            }
            : {
                'aria-expanded': 'false',
                'aria-haspopup': ariaRole === 'alertdialog' ? 'dialog' : ariaRole,
                'aria-controls': floatingId,
                ...(ariaRole === 'listbox' && { role: 'combobox' }),
                ...(ariaRole === 'menu' && { id: referenceId }),
                ...(ariaRole === 'menu' && isNested && { role: 'menuitem' }),
                ...(role === 'select' && { 'aria-autocomplete': 'none' }),
                ...(role === 'combobox' && { 'aria-autocomplete': 'list' }),
            }),
    }

    const floating: ElementProps['floating'] = {
        id: floatingId,
        ...(ariaRole && { role: ariaRole }),
        ...(ariaRole === 'tooltip' || role === 'label'
            ? {}
            : {
                ...(ariaRole === 'menu' && { 'aria-labelledby': referenceId }),
            }),
    }

    const item: ElementProps['item'] = ({ active, selected }) => {
        const commonProps = {
            role: 'option',
            ...(active && { id: `${floatingId}-option` }),
        }

        // For `menu`, we are unable to tell if the item is a `menuitemradio`
        // or `menuitemcheckbox`. For backwards-compatibility reasons, also
        // avoid defaulting to `menuitem` as it may overwrite custom role props.
        switch (role) {
            case 'select':
                return {
                    ...commonProps,
                    'aria-selected': active && selected,
                }
            case 'combobox': {
                return {
                    ...commonProps,
                    'aria-selected': selected,
                }
            }
        }

        return {}
    }

    return enabled ? { reference, floating, item } : {}
}