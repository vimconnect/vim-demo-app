'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from './cn.js';
import { avatarInitials, avatarVariants, firstLetter } from './avatarShared.js';
const isPhotoUrl = (src) => !!src && /^(https?:\/\/|data:image\/)/i.test(src.trim());
/** Avatar (DS → Avatar): a person's photo, or their initials on `--gradient-primary`. Apps use `AppIcon`. */
export function Avatar({ name, email, src, size = 'md', ring = false, label, loading = 'lazy', className, ...rest }) {
    const [failedSrc, setFailedSrc] = useState(null);
    const [loadedSrc, setLoadedSrc] = useState(null);
    const tryPhoto = isPhotoUrl(src) && failedSrc !== src;
    const photoShown = tryPhoto && loadedSrc === src;
    const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
    const initials = avatarInitials(name, email);
    // Read on mount too: a server-rendered photo can settle before hydration.
    const checkSettled = useCallback((img) => {
        if (!img?.complete || !src)
            return;
        if (img.naturalWidth === 0)
            setFailedSrc(src);
        else
            setLoadedSrc(src);
    }, [src]);
    const fallback = initials === '?' ? (_jsx(User, { "aria-hidden": "true", className: "size-[58%]", strokeWidth: 2.25 })) : size === 'xs' ? (firstLetter(initials)) : (initials);
    return (_jsxs("span", { "data-ui": "avatar", "data-fallback": photoShown ? undefined : '', className: cn(avatarVariants({ size, ring }), className), ...a11y, ...rest, children: [!photoShown && fallback, tryPhoto && (_jsx("img", { src: src, alt: "", className: cn('absolute inset-0 block size-full object-cover', !photoShown && 'opacity-0'), referrerPolicy: "no-referrer", loading: loading, ref: checkSettled, onLoad: () => setLoadedSrc(src), onError: () => setFailedSrc(src) }))] }));
}
