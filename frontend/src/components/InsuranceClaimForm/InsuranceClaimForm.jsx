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
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as necessary
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js"; // Import CryptoJS for encryption
import lighthouse from "@lighthouse-web3/sdk";
import forge from "node-forge";

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

  const navigate = useNavigate();

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

  // New state variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [docHash, setDocHash] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const encryptionKey = "some-key";
  console.log("🚀 ~ InsuranceClaimForm ~ encryptionKey:", encryptionKey);
  const apiKey = "a82656cd.fce7a9c4b43e4ff8ad5e24c1414576ed";
  console.log("🚀 ~ InsuranceClaimForm ~ apiKey:", apiKey);

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

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
    setUploadSuccess(false);
    setUploadError("");
  };
  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log("Upload progress:", percentageDone + "%");
  };

  const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target.result;
        // Convert ArrayBuffer to base64 string
        const base64String = btoa(
          new Uint8Array(fileData).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        // Create an object with file metadata and data
        const fileObj = {
          name: file.name,
          type: file.type,
          data: base64String,
        };

        // Convert the object to a JSON string
        const fileString = JSON.stringify(fileObj);

        // Encrypt the JSON string
        const encryptedData = CryptoJS.AES.encrypt(
          fileString,
          encryptionKey
        ).toString();

        // Create a Blob from the encrypted data
        const encryptedBlob = new Blob([encryptedData], { type: "text/plain" });

        // Create a File object with the encrypted Blob and original filename
        const encryptedFile = new File([encryptedBlob], file.name, {
          type: "text/plain",
        });

        resolve([encryptedBlob, encryptedFile]);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess(false);

      // Encrypt and collect encrypted blobs and files
      if (!selectedFiles || selectedFiles.length === 0) {
        console.log("No files selected.");
        return;
      }
      try {
        const encryptedFiles = [];
        const encryNew = [];

        // Encrypt each file individually without using Promise.all
        for (let i = 0; i < selectedFiles.length; i++) {
          const encryptedFileTemp = await encryptFile(selectedFiles[i]);
          encryptedFiles.push(encryptedFileTemp[0]);
          encryNew.push(encryptedFileTemp[1]);
        }

        // Upload the encrypted files as a directory
        const output = await lighthouse.upload(
          encryptedFiles,
          apiKey,
          true,
          progressCallback
        );

        const url = `https://gateway.lighthouse.storage/ipfs/${output.data.Hash}`;

        // Upload the encrypted files as a directory
        const outputFile = await lighthouse.upload(
          encryNew,
          apiKey,
          true,
          progressCallback
        );
        console.log("🚀 ~ handleUpload ~ outputFile", outputFile.data.Hash);

        // setUploadedUrl(url); // Set the uploaded URL

        // const urlFile = `https://gateway.lighthouse.storage/ipfs/${outputFile.data.Hash}`;

        // setUploadedUrlFile(urlFile); // Set the uploaded URL

        // Set success message and reset file input
        // setSuccessMessage("Files uploaded successfully!");
        // setSelectedFiles([]); // Clear file selection
        setDocHash(outputFile.data.Hash);
        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading files:", error);
        // setSuccessMessage("File upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadError("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!docHash) {
        setUploadError("Please upload documents before submitting the claim.");
        return;
      }

      console.log("Form Data:", data);

      // Generate unique reimbursement ID
      const rid = uuidv4(); // Using UUID for uniqueness

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

      // Reset the form
      document.getElementById("insurance-claim-form").reset();
      setSelectedFiles([]);
      setDocHash("");
      setUploadSuccess(false);
      setUploadError("");

      // Navigate to the user claims page
      navigate("/list-claims");
    } catch (error) {
      console.error("Error submitting claim:", error);
    }
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid container spacing={1} alignItems="center" justifyContent="center">
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
              id="insurance-claim-form"
            >
              <Typography variant="h6" align="center" gutterBottom>
                <b>Insurance Claim Form</b>
              </Typography>
              <Stack spacing={1}>
                {/* ... Other form fields ... */}
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

                {/* File Upload Section */}
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
                        onChange={handleFileChange}
                        required
                      />
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {[...selectedFiles].map((file, index) => (
                          <Typography variant="body2" key={index}>
                            {file.name}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CloudUpload />}
                      onClick={handleUpload}
                      disabled={selectedFiles.length === 0 || uploading}
                      sx={{ mt: 2 }}
                    >
                      {uploading ? "Uploading..." : "Upload Documents"}
                    </Button>
                    {uploadSuccess && (
                      <Typography variant="body2" color="success.main">
                        Documents uploaded successfully!
                      </Typography>
                    )}
                    {uploadError && (
                      <Typography variant="body2" color="error">
                        {uploadError}
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
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
