import React from 'react';
import { Link, NavLink } from 'react-router';

// All header styles are in styles/critical.css and inlined in <head>

const Header = (): React.JSX.Element => {
    return (
        <header data-critical-css="header">
            <Link data-critical-css="logo" to="/">
                <h1>piech.dev</h1>
            </Link>

            <nav data-critical-css="nav">
                <NavLink data-critical-css="nav-link" to="/">
                    About me
                </NavLink>
                <NavLink data-critical-css="nav-link" to="/portfolio">
                    Portfolio
                </NavLink>
                <NavLink data-critical-css="nav-link" to="/contact">
                    Contact
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;
