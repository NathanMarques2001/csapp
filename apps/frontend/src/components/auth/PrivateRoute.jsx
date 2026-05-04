import React from "react";
import { useCookies } from "react-cookie";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const [cookies] = useCookies(["jwtToken"]);
    const isAuthenticated = !!cookies.jwtToken;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
