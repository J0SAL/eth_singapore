import React, { useCallback, useEffect, useState } from "react";
import "../HomePage/HomePage.css";
import { useAuth } from "../../context/AuthContext";
import { WorldCoinWidget } from "../WorldCoinWidget/WorldCoinWidget";
import { useNavigate } from "react-router-dom";
import { PAGE_LOGO, PAGE_TITLE } from "../../utils/constants";
import { Grid, Typography } from "@mui/material";
import { Button, Image } from "react-bootstrap";

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
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        <Grid item xs={12} md={6} className="image-content">
                            <Image
                                src="/login_banner.png"
                                alt="Reimbursement Process"
                                fluid
                            />
                        </Grid>
                        <Grid item xs={12} md={6} className="text-content">
                            <Typography variant="h2" component="h1" gutterBottom>
                                {PAGE_TITLE}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Submit your claims in just a few clicks, with real-time status updates.
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Our platform offers a simple, fast, and secure way to submit and track your reimbursement claims.
                                Whether it's for health insurance, accident claims, or any medical expense, we ensure a seamless
                                experience from start to finish.
                            </Typography>
                            <Button
                                color="primary"
                                size="large"
                                onClick={handleDashboardClick}
                                className="cta-button"
                                style={{ marginTop: "40px", background: "purple" }}
                            >
                                Create Reimbursement Request
                            </Button>
                        </Grid>

                    </Grid>
                </>

            );
        } else if (loggedIn && !isWorldIdVerified) {
            return (
                <>
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        <Grid item xs={12} md={6} className="image-content">
                            <Image
                                src="/login_banner.png"
                                alt="Reimbursement Process"
                                fluid
                            />
                        </Grid>
                        <Grid item xs={12} md={6} className="text-content">
                            <Typography variant="h2" component="h1" gutterBottom>
                                {PAGE_TITLE}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Submit your claims in just a few clicks, with real-time status updates.
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Our platform offers a simple, fast, and secure way to submit and track your reimbursement claims.
                                Whether it's for health insurance, accident claims, or any medical expense, we ensure a seamless
                                experience from start to finish.
                            </Typography>
                            <WorldCoinWidget />
                        </Grid>

                    </Grid>
                </>
            );
        } else {
            return (
                <>
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        <Grid item xs={12} md={6} className="image-content">
                            <Image
                                src="/login_banner.png"
                                alt="Reimbursement Process"
                                fluid
                            />
                        </Grid>
                        <Grid item xs={12} md={6} className="text-content">
                            <Typography variant="h2" component="h1" gutterBottom>
                                {PAGE_TITLE}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Submit your claims in just a few clicks, with real-time status updates.
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Our platform offers a simple, fast, and secure way to submit and track your reimbursement claims.
                                Whether it's for health insurance, accident claims, or any medical expense, we ensure a seamless
                                experience from start to finish.
                            </Typography>
                            <Button
                                color="primary"
                                size="large"
                                onClick={handleLogin}
                                className="cta-button"
                                style={{ marginTop: "40px", background: "purple" }}
                            >
                                Login
                            </Button>
                        </Grid>

                    </Grid>
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
