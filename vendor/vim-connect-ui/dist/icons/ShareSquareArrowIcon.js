import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
export function ShareSquareArrowIcon({ width = 26, height = 24, ...props }) {
    const uid = useId();
    return (_jsxs("svg", { width: width, height: height, viewBox: "0 0 26 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true, ...props, children: [_jsx("g", { clipPath: `url(#${uid}-ShareSquareArrowIcon_clip0_215_20)`, children: _jsx("path", { d: "M18.6082 14.8172L26 7.4086L18.6082 0L18.608 3.76424C12.9188 3.99601 7.924 7.49719 7.43713 14.7523C10.2415 11.2247 13.934 10.1655 18.6082 11.1264V14.8172ZM0 6C0 5.44772 0.447715 5 1 5H8.85352L6.85352 7H2V22H22V16L24 14V23C24 23.5523 23.5523 24 23 24H1C0.447715 24 0 23.5523 0 23V6Z", fillRule: "evenodd", clipRule: "evenodd", fill: "currentColor" }) }), _jsx("defs", { children: _jsx("clipPath", { id: `${uid}-ShareSquareArrowIcon_clip0_215_20`, children: _jsx("rect", { width: "26", height: "24", fill: "white" }) }) })] }));
}
