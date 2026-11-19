const DROPDOWN_GAP = 4;
const VIEWPORT_MARGIN = 8;
export function computeDropdownRect(trigger, wantedHeight, { maxHeight, minHeight }) {
    const spaceBelow = window.innerHeight - trigger.bottom - DROPDOWN_GAP - VIEWPORT_MARGIN;
    const spaceAbove = trigger.top - DROPDOWN_GAP - VIEWPORT_MARGIN;
    const flip = wantedHeight > spaceBelow && spaceAbove > spaceBelow;
    const available = Math.max(minHeight, flip ? spaceAbove : spaceBelow);
    return {
        ...(flip
            ? { bottom: window.innerHeight - trigger.top + DROPDOWN_GAP }
            : { top: trigger.bottom + DROPDOWN_GAP }),
        left: trigger.left,
        width: trigger.width,
        maxHeight: Math.min(maxHeight, available),
    };
}
