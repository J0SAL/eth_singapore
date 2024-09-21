// src/InsuranceClaimForm.js
import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  InputAdornment,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CloudUpload,
  Send,
  Title as TitleIcon,
  Subject as SubjectIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: "#ffffffdd",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  backdropFilter: "blur(5px)",
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  "&:after": {
    content: '""',
    background: theme.palette.secondary.main,
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    transition: "all 0.3s",
    zIndex: -1,
  },
  "&:hover:after": {
    left: 0,
  },
  "&:hover": {
    color: "#fff",
  },
}));

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

const InsuranceClaimForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const documents = watch("documents") || [];

  const onSubmit = (data) => {
    console.log(data);
    setOpenSnackbar(true);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
        >
          {/* Left Side - Image */}
          <Grid item xs={12} md={6}>
            <img
              src="https://plus.unsplash.com/premium_photo-1661335273735-28702a0e32a5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Insurance"
              style={{ width: "100%", height: "auto" }}
            />
          </Grid>

          {/* Right Side - Form */}
          <Grid item xs={12} md={6}>
            <FormContainer
              component={motion.form}
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                <b>Insurance Claim Form</b>
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Title"
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.title}
                  helperText={errors.title ? "Title is required" : ""}
                  {...register("title", { required: true })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Subject"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  error={!!errors.subject}
                  helperText={errors.subject ? "Subject is required" : ""}
                  {...register("subject", { required: true })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SubjectIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Upload Documents
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUpload />}
                      color="secondary"
                    >
                      Choose Files
                      <input
                        type="file"
                        name="documents"
                        hidden
                        multiple
                        {...register("documents", { required: true })}
                      />
                    </Button>
                    {errors.documents && (
                      <Typography variant="body2" color="error">
                        Please upload at least one document.
                      </Typography>
                    )}
                    {documents.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {[...documents].map((file, index) => (
                          <Typography variant="body2" key={index}>
                            {file.name}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
                <AnimatedButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  endIcon={<Send />}
                  fullWidth
                >
                  Submit Claim
                </AnimatedButton>
              </Stack>
            </FormContainer>
          </Grid>
        </Grid>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Your claim has been submitted successfully!
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </>
  );
};

export default InsuranceClaimForm;
