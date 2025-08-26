import { $, $$ } from 'woby'

import type { ElementProps } from '../types'
import { ACTIVE_KEY, FOCUSABLE_ATTRIBUTE, SELECTED_KEY } from '../utils/constants'

export type ExtendedUserProps = {
    [ACTIVE_KEY]?: boolean
    [SELECTED_KEY]?: boolean
}

function mergeProps<Key extends keyof ElementProps>(
    userProps: (Record<string, any> & ExtendedUserProps) | undefined,
    propsList: Array<ElementProps | void>,
    elementKey: Key,
): Record<string, unknown> {
    const map = new Map<string, Array<(...args: unknown[]) => void>>()
    const isItem = elementKey === 'item'

    let domUserProps = userProps
    if (isItem && userProps) {
        const { [ACTIVE_KEY]: _, [SELECTED_KEY]: __, ...validProps } = userProps
        domUserProps = validProps
    }

    return {
        ...(elementKey === 'floating' && {
            tabIndex: -1,
            [FOCUSABLE_ATTRIBUTE]: '',
        }),
        ...domUserProps,
        ...propsList
            .map((value) => {
                const propsOrGetProps = value ? value[elementKey] : null
                if (typeof propsOrGetProps === 'function') {
                    return userProps ? propsOrGetProps(userProps) : null
                }
                return propsOrGetProps
            })
            .concat(userProps)
            .reduce((acc: Record<string, unknown>, props) => {
                if (!props) {
                    return acc
                }

                Object.entries(props).forEach(([key, value]) => {
                    if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) {
                        return
                    }

                    if (key.indexOf('on') === 0) {
                        if (!map.has(key)) {
                            map.set(key, [])
                        }

                        if (typeof value === 'function') {
                            map.get(key)?.push(value as (...args: unknown[]) => void)

                            acc[key] = (...args: unknown[]) => {
                                return map
                                    .get(key)
                                    ?.map((fn) => fn(...args))
                                    .find((val) => val !== undefined)
                            }
                        }
                    } else {
                        acc[key] = value
                    }
                })

                return acc
            }, {}),
    }
}

export interface UseInteractionsReturn {
    getReferenceProps: (
        userProps?: Record<string, any>,
    ) => Record<string, unknown>
    getFloatingProps: (
        userProps?: Record<string, any>,
    ) => Record<string, unknown>
    getItemProps: (
        userProps?: Record<string, any> & ExtendedUserProps,
    ) => Record<string, unknown>
}

/**
 * Merges an array of interaction hooks' props into prop getters, allowing
 * event handler functions to be composed together without overwriting one
 * another.
 * @see https://floating-ui.com/docs/useInteractions
 */
export function useInteractions(
    propsList: Array<ElementProps | void> = [],
): UseInteractionsReturn {
    // const referenceDeps = propsList.map((key) => key?.reference)
    // const floatingDeps = propsList.map((key) => key?.floating)
    // const itemDeps = propsList.map((key) => key?.item)

    const getReferenceProps = (userProps?: Record<string, any>) =>
        mergeProps(userProps, propsList, 'reference')

    const getFloatingProps = (userProps?: Record<string, any>) =>
        mergeProps(userProps, propsList, 'floating')

    const getItemProps = (userProps?: Record<string, any> & ExtendedUserProps) =>
        mergeProps(userProps, propsList, 'item')

    return {
        getReferenceProps,
        getFloatingProps,
        getItemProps,
    }
}