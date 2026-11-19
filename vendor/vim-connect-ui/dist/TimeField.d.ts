export interface TimeFieldProps {
    /** `HH:mm`, or `''` for none. */
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
}
export declare function TimeField({ value, onChange, placeholder, id, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, }: TimeFieldProps): import("react/jsx-runtime").JSX.Element;
