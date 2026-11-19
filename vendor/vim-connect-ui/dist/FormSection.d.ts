import React from 'react';
export interface FormSectionHeaderProps {
    /** The icon, drawn 16px in `--color-cyan` on the icon tile. */
    icon?: React.ReactNode;
    title: React.ReactNode;
    /** One line under the title; may end with an inline link. */
    description?: React.ReactNode;
    /** Every field in the section is required: a red asterisk after the title. */
    required?: boolean;
    /** The title element's id (FormSection uses it to name the section). */
    titleId?: string;
    /** Heading level. Default 3. */
    level?: 2 | 3 | 4;
    className?: string;
}
export declare function FormSectionHeader({ icon, title, description, required, titleId, level, className, }: FormSectionHeaderProps): import("react/jsx-runtime").JSX.Element;
export interface FormSectionProps extends Omit<FormSectionHeaderProps, 'titleId' | 'className'> {
    children: React.ReactNode;
    className?: string;
}
/** A section of a long form: header, then its `FormRow`s. Consecutive sections space themselves. */
export declare function FormSection({ children, className, ...header }: FormSectionProps): import("react/jsx-runtime").JSX.Element;
export interface FormRowProps {
    label: React.ReactNode;
    /** The control (or controls). One element is wired to the label automatically. */
    children: React.ReactNode;
    /** Help under the label, in the label column. */
    description?: React.ReactNode;
    /** Error under the control. Turns a single wired control red and is announced with it. */
    error?: React.ReactNode;
    /** Red asterisk. Mark required rows only where most of the form isn't. */
    required?: boolean;
    /** "(optional)" — mark the exceptions, not the required rows. */
    optional?: boolean;
    /** After the label's markers: a status pill ("Not required"). */
    adornment?: React.ReactNode;
    /** The id of the control the label names, when the row holds several. */
    htmlFor?: string;
    /**
     * Tie the label to a single label-able child (default `true`). An unmarked
     * child already gets a text label; `false` keeps the label text even for a
     * label-able one.
     */
    wire?: boolean;
    className?: string;
}
export declare function FormRow({ label, children, description, error, required, optional, adornment, htmlFor, wire: autoWire, className, }: FormRowProps): import("react/jsx-runtime").JSX.Element;
