// The app's copy goes through the shared helper (navigator.clipboard, then execCommand in the
// extension's iframe); callers and test mocks keep importing it from here.
export { copyText } from '@vim-connect/ui';
