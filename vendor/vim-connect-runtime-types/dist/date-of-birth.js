// Leaf module — zero imports, like brand-color.ts, so the console's browser
// bundle can take the mask and the validator without pulling in the zod schema
// graph, and the backend can take the validator alone.
//
// The one definition of a date of birth, shared by the console form, the
// backend submission gate, and the extension's patient header. Nothing here
// builds a `Date` out of a supplied value — a date-only string parses as UTC
// midnight, which is the previous day for every reader west of UTC. The only
// `Date` read is of the current moment, for the reader's own calendar day.
/** The literal shape the form stores: `MM/DD/YYYY`. */
export const DOB_FORMAT = "MM/DD/YYYY";
/** Digits in a complete date — 2 month + 2 day + 4 year. */
const DOB_DIGITS = 8;
/**
 * Nobody enrolling a company was born before this. Catches a mistyped year.
 *
 * Exported because the calendar needs the same floor for the years it offers — a
 * picker that lists a year the validator rejects is a trap.
 */
export const MIN_DOB_YEAR = 1900;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** The components as a calendar day, or `null` when the calendar has no such day. */
function calendarDay(year, month, day) {
    if (month < 0 || month > 11 || day < 1)
        return null;
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const lastDay = month === 1 && isLeapYear ? 29 : DAYS_IN_MONTH[month];
    return day <= lastDay ? { year, month, day } : null;
}
// The four shapes this module recognizes, kept together: two spellings of an
// ISO date and two of a US one, and the difference between each pair is the
// whole contract. Change one and check its sibling.
/** Year, month and day of an ISO date. */
const ISO_DATE_GROUPS = String.raw `(\d{4})-(\d{2})-(\d{2})`;
/** A bare ISO date — the one paste whose field order is unambiguous. */
const ISO_DATE_PASTE_RE = new RegExp(String.raw `^${ISO_DATE_GROUPS}$`);
/** An ISO date, with any clock time the source appended to it. */
const ISO_CALENDAR_DATE_RE = new RegExp(String.raw `^${ISO_DATE_GROUPS}(?:[T ]\d{2}:\d{2}.*)?$`);
/** `MM/DD/YYYY` exactly — what the form stores and the mask emits. */
const FORM_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
/** `M/D/YYYY`, either field padded or not — what an EHR may render. */
const US_CALENDAR_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
/**
 * The calendar day a complete `MM/DD/YYYY` names, or `null` if it isn't one or
 * names a day the calendar does not have.
 *
 * Exported so the picker reads the stored value with the same rule that
 * validates it.
 */
export function parseDateOfBirth(value) {
    const m = FORM_DATE_RE.exec(typeof value === "string" ? value.trim() : "");
    return m ? calendarDay(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
}
/**
 * The calendar day a date of birth names, or `null` when the value is in
 * neither accepted shape or names a day the calendar does not have.
 *
 * Accepts `YYYY-MM-DD`, the canonical date the extraction pipeline emits — a
 * trailing clock time is discarded, not resolved — and `M/D/YYYY`. Any other
 * shape is for the collection's `inputFormat` to normalize upstream: do not
 * widen this to `new Date()`, which resolves a date-only value against a zone.
 *
 * Scraped values reach this through an unchecked cast, so the declared type is
 * not enforced at the call site — a non-string must return `null`, never throw.
 */
export function calendarDateOfBirth(value) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    const iso = ISO_CALENDAR_DATE_RE.exec(trimmed);
    if (iso)
        return calendarDay(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    const mdy = US_CALENDAR_DATE_RE.exec(trimmed);
    if (mdy)
        return calendarDay(Number(mdy[3]), Number(mdy[1]) - 1, Number(mdy[2]));
    return null;
}
/** A calendar day as `MM/DD/YYYY`. */
export function formatDateOfBirth(date) {
    const month = String(date.month + 1).padStart(2, "0");
    const day = String(date.day).padStart(2, "0");
    return `${month}/${day}/${date.year}`;
}
/**
 * Whole years from `dob` to the day `on` falls on, or `null` when that day
 * precedes the birth.
 *
 * `on` is read through its local components — the reader's calendar day, never
 * the UTC one.
 */
export function ageInYears(dob, on) {
    const month = on.getMonth();
    const beforeBirthday = month < dob.month || (month === dob.month && on.getDate() < dob.day);
    const age = on.getFullYear() - dob.year - (beforeBirthday ? 1 : 0);
    return age >= 0 ? age : null;
}
/**
 * Format keystrokes as `MM/DD/YYYY`, inserting the slashes.
 *
 * Digits only and capped at 8, so `03-04-1978` and `03041978` both land on
 * `03/04/1978` rather than on a string the validator rejects for a reason the
 * developer cannot see. Partial input is returned partially formatted — this
 * runs on every keystroke, and a mask that only formatted complete dates would
 * make the slashes appear all at once at the end.
 *
 * A full ISO date is reordered rather than stripped, because stripping it gives
 * the wrong answer confidently: `1978-03-04` would become `19/78/0304`, which
 * reads as a typo the developer did not make. It is the only reordering done
 * here — a four-digit leading group can only be a year, whereas `03-04-1978`
 * could be either field order and is left in the order it was typed.
 */
export function maskDateOfBirth(input) {
    const iso = ISO_DATE_PASTE_RE.exec((input ?? "").trim());
    if (iso)
        return `${iso[2]}/${iso[3]}/${iso[1]}`;
    const digits = (input ?? "").replace(/\D/g, "").slice(0, DOB_DIGITS);
    if (digits.length > 4)
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    if (digits.length > 2)
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}
/**
 * Whether a value is a complete, real, past date in `MM/DD/YYYY`.
 *
 * "Real" means the calendar accepts it, which a regex cannot decide: `02/30/1990`
 * matches any shape check and is not a date — `parseDateOfBirth` rejects it.
 *
 * Incomplete input is `false`, not an error: this is called on every keystroke.
 * Callers that must distinguish "not finished" from "wrong" test length first —
 * see `dateOfBirthError`.
 */
export function isValidDateOfBirth(value) {
    const parts = parseDateOfBirth(value);
    if (!parts)
        return false;
    if (parts.year < MIN_DOB_YEAR)
        return false;
    // A date still ahead of today has no age.
    return ageInYears(parts, new Date()) !== null;
}
/**
 * The message for a DOB that is present but wrong, or `null` when there is
 * nothing to say.
 *
 * Silent on empty and on partial input. A field the developer is still typing
 * into is not yet an error, and marking it red at the second keystroke trains
 * people to ignore the marker.
 */
export function dateOfBirthError(value) {
    const trimmed = (value ?? "").trim();
    if (trimmed === "")
        return null;
    if (trimmed.replace(/\D/g, "").length < DOB_DIGITS)
        return null;
    return isValidDateOfBirth(trimmed) ? null : `Enter a real date as ${DOB_FORMAT}`;
}
//# sourceMappingURL=date-of-birth.js.map