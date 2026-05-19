import React from 'react';

const baseProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const makeIcon = (paths) => () => <svg {...baseProps}>{paths}</svg>;

export const RotateCwIcon = makeIcon(
  <>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 3v6h-6" />
  </>
);

export const UploadIcon = makeIcon(
  <>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 20h16" />
  </>
);

export const PhoneIcon = makeIcon(
  <>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9Z" />
  </>
);

export const PaperPlaneIcon = makeIcon(
  <path d="M22 2 11 13" />,
);

export const HomeIcon = makeIcon(
  <>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10.5V20h14v-9.5" />
    <path d="M9 20v-6h6v6" />
  </>
);

export const TeamIcon = makeIcon(
  <>
    <path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <path d="M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M22 20v-2a4 4 0 0 0-3-3.8" />
    <path d="M16.5 4.3a3 3 0 0 1 0 5.4" />
  </>
);

export const ShareIcon = makeIcon(
  <>
    <path d="M4 12h9" />
    <path d="M10 8l4 4-4 4" />
    <path d="M13 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
  </>
);

export const DeviceIcon = makeIcon(
  <>
    <rect x="4" y="5" width="16" height="12" rx="2" />
    <path d="M8 19h8" />
    <path d="M12 17v2" />
  </>
);

export const UserIcon = makeIcon(
  <>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </>
);

export const CloseIcon = makeIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="M6 6 18 18" />
  </>
);

export const MenuIcon = makeIcon(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);
