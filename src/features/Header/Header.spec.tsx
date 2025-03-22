import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import Header from 'features/Header/Header';

describe('Header', () => {
    it('should render header with piech.dev title', () => {
        render(<Header />);

        const headingElement = screen.getByRole('heading', {
            level: 1,
            name: /piech\.dev/i,
        });

        expect(headingElement).toBeInTheDocument();
    });
});
