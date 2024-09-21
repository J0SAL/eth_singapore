// src/PolicyListPage.js
import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  CircularProgress,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { format } from "date-fns";
import { CloudDownload } from "@mui/icons-material";
import { Box } from "@mui/system";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6200ea",
    },
    secondary: {
      main: "#03dac6",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

const PolicyCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const PolicyListPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "policies"));
      const policiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolicies(policiesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };
  const PolicyCard = styled(Card)(({ theme }) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.02)",
    },
  }));

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: "url(https://plus.unsplash.com/premium_photo-1661335273735-28702a0e32a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aW5zdXJhbmNlfGVufDB8fDB8fHww)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          py: 8,
        }}
      >
        <Typography variant="h3" align="center" color="black" gutterBottom>
          Welcome to the Policy Dashboard
        </Typography>
      </Box>
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom>
          Uploaded Policies
        </Typography>
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={4}>
            {policies.map((policy) => (
              <Grid item key={policy.id} xs={12} sm={6} md={4}>
                <PolicyCard>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {policy.policyName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {policy.policyDescription}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 2 }}
                    >
                      Uploaded At:{" "}
                      {policy.uploadedAt
                        ? format(policy.uploadedAt.toDate(), "PPpp")
                        : "N/A"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {policy.files &&
                      policy.files.map((file, index) => (
                        <Button
                          key={index}
                          size="small"
                          color="primary"
                          href={file.url}
                          target="_blank"
                          startIcon={<CloudDownload />}
                        />
                      ))}
                  </CardActions>
                </PolicyCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default PolicyListPage;
