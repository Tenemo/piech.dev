import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
    'aria-hidden': true,
    fill: 'none',
    focusable: false,
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.75,
};

export const ArrowBackIcon = (props: IconProps): React.JSX.Element => (
    <svg {...baseProps} viewBox="0 0 24 24" {...props}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
    </svg>
);

export const EmailIcon = (props: IconProps): React.JSX.Element => (
    <svg {...baseProps} viewBox="0 0 24 24" {...props}>
        <rect height="14" rx="2" width="20" x="2" y="5" />
        <path d="m3 7 9 7 9-7" />
    </svg>
);

export const GitHubIcon = (props: IconProps): React.JSX.Element => (
    <svg
        aria-hidden={true}
        fill="currentColor"
        focusable={false}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.6-1.4-5.6-6.1 0-1.3.5-2.4 1.3-3.3-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0c2.4-1.6 3.4-1.3 3.4-1.3.7 1.6.2 2.9.1 3.2.8.9 1.3 2 1.3 3.3 0 4.7-2.9 5.8-5.6 6.1.4.4.8 1.1.8 2.1v3.2c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
);

export const LinkedInIcon = (props: IconProps): React.JSX.Element => (
    <svg
        aria-hidden={true}
        fill="currentColor"
        focusable={false}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M4.98 3.5A2.49 2.49 0 1 0 5 8.48a2.49 2.49 0 0 0-.02-4.98ZM2.5 9h5V21h-5V9Zm8 0h4.8v1.7h.1c.7-1.2 2.3-2.2 4.7-2.2 5 0 5.9 3.3 5.9 7.6V21h-5v-4.4c0-2.1 0-4.8-2.9-4.8s-3.4 2.3-3.4 4.7V21h-5V9Z" />
    </svg>
);

export const OpenInNewIcon = (props: IconProps): React.JSX.Element => (
    <svg {...baseProps} viewBox="0 0 24 24" {...props}>
        <path d="M14 5h5v5" />
        <path d="m10 14 9-9" />
        <path d="M19 14v5H5V5h5" />
    </svg>
);

export const TelegramIcon = (props: IconProps): React.JSX.Element => (
    <svg
        aria-hidden={true}
        fill="currentColor"
        focusable={false}
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M21.9 4.6c.3-1.4-.5-1.9-1.7-1.5L3.4 9.6c-1.2.5-1.2 1.2-.2 1.5l4.3 1.3 10-6.3c.5-.3.9-.1.5.2L9.9 13.8v5.3c0 .7.3 1 .8 1 .4 0 .6-.2 1-.6l2.1-2.1 4.4 3.2c.8.5 1.4.2 1.6-.7L21.9 4.6Z" />
    </svg>
);
