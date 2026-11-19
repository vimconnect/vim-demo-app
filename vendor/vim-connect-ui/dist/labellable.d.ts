import type React from 'react';
type Forwards = {
    id?: string;
    'aria-describedby'?: string;
};
/** Only compiles for a component whose props take `id` and `aria-describedby`. */
export declare function markLabellable<T extends React.JSXElementConstructor<any>>(component: T & (React.ComponentProps<T> extends Forwards ? unknown : never)): T;
/** Whether an element type is label-able: a native control, a marked component, or a memo of one. */
export declare function isLabellable(type: unknown): boolean;
export {};
