import React from 'react';
import { createRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Not hydrating anything, just creating - but it does not matter,
// as there is no JS included at all.
createRoot(document).render(
    <React.StrictMode>
        <HydratedRouter />
    </React.StrictMode>,
);
