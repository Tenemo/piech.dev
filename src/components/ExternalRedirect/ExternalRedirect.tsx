import React, { useEffect } from 'react';

type ExternalRedirectProps = {
    url: string;
};

const ExternalRedirect = ({
    url,
}: ExternalRedirectProps): React.JSX.Element | null => {
    useEffect(() => {
        window.location.href = url;
    }, [url]);

    return null;
};

export default ExternalRedirect;
