import React from 'react';
export interface PatientHeaderProps {
    /** The patient's display name. Empty or missing shows "Unknown patient". */
    name?: string | null;
    /** `YYYY-MM-DD` or `M/D/YYYY`: shown as `MM/DD/YYYY` with the age. Any other short value is shown as written, with no age. */
    dateOfBirth?: string | null;
    /** Sex or gender as the source gives it; shown in sentence case. */
    sex?: string | null;
    /** More items for the detail line, after sex (e.g. "MRN 004512"). */
    details?: string[];
    /** Right side: badges, source icons, an `ActionMenu`. */
    aside?: React.ReactNode;
    /** `compact` for a narrow side panel; `default` for a page. */
    size?: 'default' | 'compact';
    /** Render the name as a heading at this level (a page's patient header); otherwise plain text. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The date `age` is counted to. Default today. */
    today?: Date;
    className?: string;
}
/** The "DOB · age · sex · …" items. Exported for surfaces that show the same line elsewhere. */
export declare function patientDetails({ dateOfBirth, sex, details, today, }: Pick<PatientHeaderProps, 'dateOfBirth' | 'sex' | 'details' | 'today'>): string[];
/**
 * Patient Header (DS → Patient Header): who the screen is about — a person glyph,
 * the patient's name, and "DOB · age · sex" — above an app or a patient page.
 * The fields are PHI: nothing here logs, tracks or stores them.
 */
export declare function PatientHeader({ name, dateOfBirth, sex, details, aside, size, headingLevel, today, className, }: PatientHeaderProps): import("react/jsx-runtime").JSX.Element;
