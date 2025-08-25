import {
  getComputedStyle,
  getContainingBlock,
  getDocumentElement,
  getParentNode,
  getWindow,
  isContainingBlock,
  isElement,
  isHTMLElement,
  isLastTraversableNode,
  isTableElement,
  isTopLayer,
} from '@floating-ui/utils/dom';
import {isStaticPositioned} from '../utils/isStaticPositioned';

type Polyfill = (element: HTMLElement) => Element | null;

function getTrueOffsetParent(
  element: HTMLElement,
  polyfill: Polyfill | undefined,
): Element | null {
  if (
    getComputedStyle(element).position === 'fixed'
  ) {
    return null;
  }

  if (polyfill) {
    return polyfill(element);
  }

  return element.offsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
export function getOffsetParent(
  element: Element,
  polyfill?: Polyfill,
): Element | Window {
  const win = getWindow(element);

  if (isTopLayer(element)) {
    return win;
  }

  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }

  let offsetParent = isHTMLElement(element) ? getTrueOffsetParent(element, polyfill) : null;

  while (
    offsetParent &&
    isTableElement(offsetParent) &&
    isStaticPositioned(offsetParent)
  ) {
    offsetParent = getTrueOffsetParent(offsetParent as HTMLElement, polyfill);
  }

  if (
    offsetParent &&
    isLastTraversableNode(offsetParent) &&
    isStaticPositioned(offsetParent) &&
    !isContainingBlock(offsetParent)
  ) {
    return win;
  }

  return offsetParent || getContainingBlock(element) || win;
}
