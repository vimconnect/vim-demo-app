/**
 * z-index for a floating panel portaled to the body (menu, popover, hover card, picker): the
 * `--z-popover` layer (design-tokens.css), above `--z-modal` so a panel opened from inside a Modal is
 * never behind it, and below `--z-tooltip`. floatingLayers.test.ts checks all three.
 */
export const zFloatingPanel = (offset = 0) => 2100 + offset;
