import {
    IconArrowLeft,
    IconBrandGithub,
    IconBrandLinkedin,
    IconBrandTelegram,
    IconExternalLink,
    IconMail,
} from '@tabler/icons-react';
import React from 'react';

type IconProps = React.ComponentProps<typeof IconArrowLeft>;

const baseProps: IconProps = {
    'aria-hidden': true,
    focusable: false,
    stroke: 1.75,
};

const renderIcon = (
    Icon: React.ElementType<IconProps>,
    props: IconProps,
): React.JSX.Element => <Icon {...baseProps} {...props} />;

export const ArrowBackIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconArrowLeft, props);

export const EmailIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconMail, props);

export const GitHubIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconBrandGithub, props);

export const LinkedInIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconBrandLinkedin, props);

export const OpenInNewIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconExternalLink, props);

export const TelegramIcon = (props: IconProps): React.JSX.Element =>
    renderIcon(IconBrandTelegram, props);
