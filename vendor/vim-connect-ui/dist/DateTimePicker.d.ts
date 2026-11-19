export interface DateTimePickerProps {
    /** `YYYY-MM-DDTHH:mm`, or `YYYY-MM-DD` with `showTime={false}`; `''` for none. */
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    id?: string;
    /** Classes for the root wrapper (width, margins). */
    className?: string;
    /** Accessible name for the trigger — needed once a value replaces the placeholder. */
    'aria-label'?: string;
    /** Forwarded onto the trigger for `Field` / `FormRow`. */
    'aria-describedby'?: string;
    /** When false, date-only (`YYYY-MM-DD`); default true keeps the hour/minute columns. */
    showTime?: boolean;
    /** Inclusive latest pickable calendar day (`YYYY-MM-DD`). Later days are disabled; Today is blocked past it. */
    max?: string;
}
export declare function DateTimePicker({ value, onChange, placeholder, id, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, showTime, max, }: DateTimePickerProps): import("react/jsx-runtime").JSX.Element;
