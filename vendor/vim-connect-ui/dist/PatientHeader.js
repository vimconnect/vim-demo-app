import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { User } from 'lucide-react';
import { ageInYears, calendarDateOfBirth, formatDateOfBirth } from '@vim-connect/runtime-types/date-of-birth';
import { cn } from './cn.js';
/** Longer than any date an EHR renders: a scraping accident must not stretch the header. */
const MAX_UNREAD_DOB_LENGTH = 32;
const sentenceCase = (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
/** The "DOB · age · sex · …" items. Exported for surfaces that show the same line elsewhere. */
export function patientDetails({ dateOfBirth, sex, details = [], today = new Date(), }) {
    const out = [];
    // Scraped values reach this through unchecked casts: a non-string is skipped, never thrown on.
    const dob = typeof dateOfBirth === 'string' ? dateOfBirth.trim() : '';
    const birth = dob ? calendarDateOfBirth(dob) : null;
    if (birth) {
        out.push(formatDateOfBirth(birth));
        const age = ageInYears(birth, today);
        if (age !== null)
            out.push(age === 1 ? '1 yr' : `${age} yrs`);
    }
    else if (dob && dob.length <= MAX_UNREAD_DOB_LENGTH) {
        out.push(dob);
    }
    if (typeof sex === 'string' && sex.trim())
        out.push(sentenceCase(sex.trim()));
    for (const d of Array.isArray(details) ? details : [])
        if (typeof d === 'string' && d.trim())
            out.push(d.trim());
    return out;
}
const SIZE = {
    default: {
        root: 'gap-[var(--space-md)] px-[var(--space-lg)] py-[var(--space-md)] min-h-[64px]',
        tile: 'size-[40px] [&_svg]:size-[18px]',
        name: 'text-[length:var(--text-lg)] [font-family:var(--font-title)]',
        meta: 'text-[length:var(--text-base)]',
    },
    compact: {
        root: 'gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-sm)] min-h-[44px]',
        tile: 'size-[28px] [&_svg]:size-[14px]',
        name: 'text-[length:var(--text-sm)]',
        meta: 'text-[length:var(--text-xs)]',
    },
};
/**
 * Patient Header (DS → Patient Header): who the screen is about — a person glyph,
 * the patient's name, and "DOB · age · sex" — above an app or a patient page.
 * The fields are PHI: nothing here logs, tracks or stores them.
 */
export function PatientHeader({ name, dateOfBirth, sex, details, aside, size = 'default', headingLevel, today, className, }) {
    const s = SIZE[size];
    const shownName = typeof name === 'string' && name.trim() ? name.trim() : 'Unknown patient';
    const items = patientDetails({ dateOfBirth, sex, details, today });
    const Name = (headingLevel ? `h${headingLevel}` : 'div');
    return (_jsxs("div", { "data-ui": "patient-header", role: "group", "aria-label": "Patient", className: cn('flex shrink-0 items-center border-0 border-b border-solid [border-color:var(--color-border-light)] [background:var(--color-bg-card)]', '[font-family:var(--font-sans)] [color:var(--color-text-primary)]', s.root, className), children: [_jsx("span", { "aria-hidden": "true", className: cn('inline-flex shrink-0 items-center justify-center rounded-[var(--radius-full)] [background:var(--color-cyan-15)] [color:var(--color-text-secondary)]', s.tile), children: _jsx(User, {}) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-[2px]", children: [_jsx(Name, { className: cn('m-0 truncate leading-[1.2] [font-weight:var(--font-semibold)]', s.name), children: shownName }), items.length > 0 && (_jsx("div", { className: cn('truncate leading-[1.4] [color:var(--color-text-secondary)]', s.meta), children: items.join(' · ') }))] }), aside && _jsx("div", { className: "flex shrink-0 items-center gap-[var(--space-sm)]", children: aside })] }));
}
