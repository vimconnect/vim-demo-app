import React from 'react';
export type StepStatus = 'upcoming' | 'active' | 'completed';
export interface StepperStep {
    /** Stable key. */
    id: string;
    /** What the step is ("Credentials", "Account setup"). */
    label: React.ReactNode;
    /** Vertical only: the icon in the step's tile while it isn't done. Default: the step number. */
    icon?: React.ReactNode;
}
export interface StepperProps {
    steps: readonly StepperStep[];
    /** Index of the step on screen. */
    current: number;
    /** Highest index the user has reached. Steps before it stay done after going Back. Default: `current`. */
    reached?: number;
    /** Makes each reached step other than the current one a button that goes back to it. Unreached steps never are. */
    onStepClick?: (index: number) => void;
    /** `horizontal` (default): equal tabs across a modal or page. `vertical`: a sidebar list with connectors. */
    orientation?: 'horizontal' | 'vertical';
    /** The current step's colour: `cyan` (default), or `blue` where the surface around it is already blue (onboarding). */
    tone?: 'cyan' | 'blue';
    /** The small line above each label. Default: "Step 1" across, "01" down. */
    caption?: (index: number) => React.ReactNode;
    /** Names the list for screen readers ("Add bot user steps"). */
    'aria-label': string;
    className?: string;
}
/** A step is done once the user has gone past it, even after going back to it; else it is current or still to come. */
export declare function stepStatus(index: number, current: number, reached?: number): StepStatus;
/**
 * Stepper: where the user is in a short, ordered flow (a modal's steps,
 * onboarding). Done steps show a green check; the current step is tinted;
 * steps still to come are muted. Going back is a click on a reached step;
 * going forward is the flow's own Next button.
 */
export declare function Stepper({ steps, current, reached, onStepClick, orientation, tone, caption, 'aria-label': ariaLabel, className, }: StepperProps): import("react/jsx-runtime").JSX.Element;
