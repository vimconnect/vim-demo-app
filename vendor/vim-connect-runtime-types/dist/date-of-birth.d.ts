/** The literal shape the form stores: `MM/DD/YYYY`. */
export declare const DOB_FORMAT = "MM/DD/YYYY";
/**
 * Nobody enrolling a company was born before this. Catches a mistyped year.
 *
 * Exported because the calendar needs the same floor for the years it offers — a
 * picker that lists a year the validator rejects is a trap.
 */
export declare const MIN_DOB_YEAR = 1900;
/**
 * A day the calendar has, with no time and no zone. `month` is 0-based, matching `Date`.
 *
 * Only `calendarDay` constructs one, so every value of this type names a real
 * day — `formatDateOfBirth` and `ageInYears` rely on that and do not re-check.
 */
export interface CalendarDate {
    year: number;
    month: number;
    day: number;
}
/**
 * The calendar day a complete `MM/DD/YYYY` names, or `null` if it isn't one or
 * names a day the calendar does not have.
 *
 * Exported so the picker reads the stored value with the same rule that
 * validates it.
 */
export declare function parseDateOfBirth(value: string | null | undefined): CalendarDate | null;
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
export declare function calendarDateOfBirth(value: string | null | undefined): CalendarDate | null;
/** A calendar day as `MM/DD/YYYY`. */
export declare function formatDateOfBirth(date: CalendarDate): string;
/**
 * Whole years from `dob` to the day `on` falls on, or `null` when that day
 * precedes the birth.
 *
 * `on` is read through its local components — the reader's calendar day, never
 * the UTC one.
 */
export declare function ageInYears(dob: CalendarDate, on: Date): number | null;
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
export declare function maskDateOfBirth(input: string): string;
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
export declare function isValidDateOfBirth(value: string | null | undefined): boolean;
/**
 * The message for a DOB that is present but wrong, or `null` when there is
 * nothing to say.
 *
 * Silent on empty and on partial input. A field the developer is still typing
 * into is not yet an error, and marking it red at the second keystroke trains
 * people to ignore the marker.
 */
export declare function dateOfBirthError(value: string | null | undefined): string | null;
//# sourceMappingURL=date-of-birth.d.ts.map