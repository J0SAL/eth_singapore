import React, { useCallback, useEffect, useState } from "react";
import "../HomePage/HomePage.css";
import { useAuth } from "../../context/AuthContext";
import { WorldCoinWidget } from "../WorldCoinWidget/WorldCoinWidget";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const { login, loggedIn, isWorldIdVerified } =
        useAuth();
    const navigate = useNavigate();

    const handleLogin = () => {
        console.log("Login Clicked");
        login();
    };

    const handleDashboardClick = useCallback(() => {
        navigate("/insurance-claim");
    }, []);

    function renderLogin() {
        if (loggedIn && isWorldIdVerified) {
            return (
                <>
                    <h1>Welcome to My Website</h1>
                    <p>Discover amazing content and engage with our community.</p>
                    <button className="login-button" onClick={handleDashboardClick}>
                        Create Reimbursement request
                    </button>
                    <br />
                    <img
                        src="https://via.placeholder.com/400"
                        alt="Homepage Banner"
                        className="homepage-image"
                    />
                </>
            );
        } else if (loggedIn && !isWorldIdVerified) {
            return (
                <>
                    <h1>Welcome to My Website</h1>
                    <p>Discover amazing content and engage with our community.</p>
                    <WorldCoinWidget />
                </>
            );
        } else {
            return (
                <>
                    <h1>Welcome to My Website</h1>
                    <p>Discover amazing content and engage with our community.</p>
                    <button className="login-button" onClick={handleLogin}>
                        Login
                    </button>
                    <br />
                    <img
                        src="https://via.placeholder.com/400"
                        alt="Homepage Banner"
                        className="homepage-image"
                    />
                </>
            );
        }
    }

    return (
        <div className="homepage">
            <div className="container">{renderLogin()}</div>
        </div>
    );
}
