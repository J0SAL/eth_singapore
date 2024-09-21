// src/InsuranceClaimForm.js
import React, { useState, useEffect } from "react";
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
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CloudUpload,
  Send,
  Title as TitleIcon,
  Subject as SubjectIcon,
  AttachMoney as AttachMoneyIcon,
  CleaningServices,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as necessary
import { v4 as uuidv4 } from "uuid";

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

  // Use useAuth() custom hook to access blockchain functions
  const {
    createReimbursementRequest,
    getTPAs,
    getHospitals,
    getInsuranceAgencies,
  } = useAuth();

  const [tpaList, setTpaList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const [insuranceList, setInsuranceList] = useState([]);

  useEffect(() => {
    // Fetch dropdown data on component mount
    const fetchDropdownData = async () => {
      try {
        // Fetch addresses from blockchain functions
        const tpaAddresses = await getTPAs();
        const hospitalAddresses = await getHospitals();
        const insuranceAddresses = await getInsuranceAgencies();

        // Map addresses to dummy names
        const tpas = tpaAddresses.map((address, index) => ({
          name: `TPA ${index + 1}`,
          address,
        }));

        const hospitals = hospitalAddresses.map((address, index) => ({
          name: `Hospital ${index + 1}`,
          address,
        }));

        const insurances = insuranceAddresses.map((address, index) => ({
          name: `Insurance ${index + 1}`,
          address,
        }));

        setTpaList(tpas);
        setHospitalList(hospitals);
        setInsuranceList(insurances);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, [getTPAs, getHospitals, getInsuranceAgencies]);

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      // Generate unique reimbursement ID
      const rid = uuidv4(); // Using UUID for uniqueness

      // Generate random docHash (for demonstration purposes)
      const docHash = uuidv4();

      // Combine Title and Subject for claimData
      const claimData = `${data.title} - ${data.subject}`;

      // Extract claimAmount
      const claimAmount = data.amount;

      // Extract selected addresses
      const tpaPublic = data.tpa;
      const hospitalPublic = data.hospital;
      const insurancePublic = data.insurance;

      // Call blockchain function
      const resp = await createReimbursementRequest(
        tpaPublic,
        insurancePublic,
        hospitalPublic,
        rid,
        docHash,
        claimData,
        claimAmount
      );
      console.log(resp);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error submitting claim:", error);
    }
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          {/* Left Side - Image */}
          <Grid item xs={12} md={6}>
            <img
              src="https://plus.unsplash.com/premium_photo-1661335273735-28702a0e32a5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Insurance"
              style={{ width: "100%", height: "100vh", objectFit: "cover" }}
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
              <Typography variant="h6" align="center" gutterBottom>
                <b>Insurance Claim Form</b>
              </Typography>
              <Stack spacing={1}>
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
                  rows={1}
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
                {/* Amount Field */}
                <TextField
                  label="Amount"
                  variant="outlined"
                  fullWidth
                  required
                  type="number"
                  error={!!errors.amount}
                  helperText={errors.amount ? "Amount is required" : ""}
                  {...register("amount", { required: true })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* TPA Dropdown */}
                <TextField
                  select
                  label="Select TPA"
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.tpa}
                  helperText={errors.tpa ? "Please select a TPA" : ""}
                  {...register("tpa", { required: true })}
                >
                  {tpaList.map((tpa) => (
                    <MenuItem key={tpa.address} value={tpa.address}>
                      {tpa.name} ({tpa.address})
                    </MenuItem>
                  ))}
                </TextField>
                {/* Hospital Dropdown */}
                <TextField
                  select
                  label="Select Hospital"
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.hospital}
                  helperText={errors.hospital ? "Please select a hospital" : ""}
                  {...register("hospital", { required: true })}
                >
                  {hospitalList.map((hospital) => (
                    <MenuItem key={hospital.address} value={hospital.address}>
                      {hospital.name} ({hospital.address})
                    </MenuItem>
                  ))}
                </TextField>
                {/* Insurance Company Dropdown */}
                <TextField
                  select
                  label="Select Insurance Company"
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.insurance}
                  helperText={
                    errors.insurance ? "Please select an insurance company" : ""
                  }
                  {...register("insurance", { required: true })}
                >
                  {insuranceList.map((insurance) => (
                    <MenuItem key={insurance.address} value={insurance.address}>
                      {insurance.name} ({insurance.address})
                    </MenuItem>
                  ))}
                </TextField>
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
