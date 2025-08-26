// Utility functions for Woby DOM package

/**
 * Checks if the pointer type is mouse-like.
 */
export function isMouseLikePointerType(pointerType: string | undefined, strict?: boolean): boolean {
    // If strict, return false for any pointer type other than 'mouse'
    if (strict) {
        return pointerType === 'mouse'
    }

    // Treat pen like mouse for interactions
    return pointerType === 'mouse' || pointerType === 'pen'
}

/**
 * Checks if an element is typeable (input, textarea, or contenteditable).
 */
export function isTypeableElement(element: Element | null): boolean {
    if (!element) return false

    const tag = element.tagName.toLowerCase()
    const type = (element as HTMLInputElement).type

    return (
        tag === 'input' ||
        tag === 'textarea' ||
        (element as HTMLElement).isContentEditable ||
        // Check for input types that are typeable
        (tag === 'input' &&
            !['checkbox', 'radio', 'file', 'submit', 'reset', 'button', 'image', 'hidden'].includes(type))
    )
}