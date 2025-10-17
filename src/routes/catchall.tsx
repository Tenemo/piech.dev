import React from 'react';
import { Navigate } from 'react-router';

const Route = (): React.JSX.Element => {
    return <Navigate replace to="/" />;
};

export default Route;
