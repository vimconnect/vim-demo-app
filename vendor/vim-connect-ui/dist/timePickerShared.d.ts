import type { Ref } from 'react';
export declare const DEFAULT_HOUR = 9;
/** Must match the time option's `h-[28px]`. */
export declare const TIME_OPTION_HEIGHT = 28;
export declare const pad2: (n: number) => string;
/** Same open ring as Select — border + focus shadow only; keep `--color-bg-field`. */
export declare const TRIGGER_OPEN = "[border-color:var(--color-cyan-40)] [box-shadow:var(--shadow-focus)]";
export declare const POPOVER: string;
export declare const DIVIDED = "border-0 border-t border-solid [border-color:var(--color-border-light)]";
export declare const SELECTED = "[background:var(--color-cyan-15)] [color:var(--color-cyan-text)] [font-weight:var(--font-semibold)] hover:[background:var(--color-cyan-20)]";
export declare const CELL_BASE: string;
interface TimeColumnsProps {
    hour: number | undefined;
    minute: number | undefined;
    onPickHour: (hour: number) => void;
    onPickMinute: (minute: number) => void;
    /** `data-ui` on each option button (product/component id). */
    buttonDataUi: string;
    className?: string;
    hourListRef?: Ref<HTMLDivElement>;
    minuteListRef?: Ref<HTMLDivElement>;
}
export declare function TimeColumns({ hour, minute, onPickHour, onPickMinute, buttonDataUi, className, hourListRef, minuteListRef, }: TimeColumnsProps): import("react/jsx-runtime").JSX.Element;
export {};
