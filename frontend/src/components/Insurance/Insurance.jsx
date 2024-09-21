// InsuranceClaims.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import VerifiedIcon from "@mui/icons-material/Verified";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import CryptoJS from "crypto-js";

const AnimatedCard = styled(motion(Card))(({ theme }) => ({
  marginBottom: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  overflow: "hidden",
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: "relative",
}));

const ProgressStep = styled(Box)(({ theme, active }) => ({
  flex: 1,
  textAlign: "center",
  position: "relative",
}));

const ProgressConnector = styled(Box)(({ theme, active }) => ({
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  height: "4px",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.grey[300],
  zIndex: -1,
}));

const StatusContainer = styled(motion(Box))(({ theme, isActive }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(1),
  backgroundColor: isActive
    ? theme.palette.success.light
    : theme.palette.warning.light,
  color: "#fff",
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
}));

const InsuranceClaims = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const {
    getInsuranceReimbursements,
    getDocumentsByReimbursementId,
    publicAddress,
    verifyInsurancePublicIp,
  } = useAuth();

  // Similar download state variables as in UserClaims
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [decryptedFiles, setDecryptedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const encryptionKey = "some-key"; // Replace with your actual encryption key

  useEffect(() => {
    const fetchReimbursements = async () => {
      try {
        const reimbs = await getInsuranceReimbursements(publicAddress);
        if (Array.isArray(reimbs)) {
          const reimbursementsWithDetails = await Promise.all(
            reimbs.map(async (reimbursement) => {
              const detailsArray = await getDocumentsByReimbursementId(
                reimbursement.reimbursementId
              );
              const details =
                detailsArray && detailsArray.length > 0 ? detailsArray[0] : {};
              return { ...reimbursement, ...details };
            })
          );
          setReimbursements(reimbursementsWithDetails);
        } else {
          setReimbursements([]);
        }
      } catch (error) {
        console.error("Failed to fetch reimbursements", error);
        setReimbursements([]);
      }
    };
    fetchReimbursements();
  }, [
    getInsuranceReimbursements,
    getDocumentsByReimbursementId,
    publicAddress,
  ]);

  const getFinalStatus = (isCompleted) => {
    if (isCompleted) {
      return (
        <StatusContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          isActive={true}
        >
          <VerifiedIcon sx={{ marginRight: 1 }} />
          <Typography variant="h6">Claim Active</Typography>
        </StatusContainer>
      );
    } else {
      return (
        <StatusContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          isActive={false}
        >
          <PendingActionsIcon sx={{ marginRight: 1 }} />
          <Typography variant="h6">Claim Pending</Typography>
        </StatusContainer>
      );
    }
  };

  // Implement retrieveAndDecryptFile function similar to UserClaims
  const retrieveAndDecryptFile = async (hash) => {
    try {
      setLoadingFiles(true);
      setDownloadError("");
      const uploadedUrlFile = `https://gateway.lighthouse.storage/ipfs/${hash}`;
      const response = await fetch(uploadedUrlFile);
      const htmlContent = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      const links = Array.from(doc.querySelectorAll("a"))
        .map((link) => link.getAttribute("href"))
        .filter((href) => href.includes("filename"))
        .map((href) => href.split("filename=")[1])
        .filter(Boolean);

      const decryptedFilesTemp = [];

      for (const fileName of links) {
        const encodedFileName = encodeURIComponent(fileName);
        const fileUrl = `${uploadedUrlFile}/${encodedFileName}`;

        const fileResponse = await fetch(`${fileUrl}`);
        const encryptedBlob = await fileResponse.blob();

        const reader = new FileReader();
        const decryptedContent = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const encryptedData = event.target.result;

            const decryptedBytes = CryptoJS.AES.decrypt(
              encryptedData,
              encryptionKey
            );
            const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

            const fileObj = JSON.parse(decryptedString);
            const { name, type, data } = fileObj;

            const byteArray = Uint8Array.from(atob(data), (char) =>
              char.charCodeAt(0)
            );

            const blob = new Blob([byteArray], { type });

            const objectUrl = URL.createObjectURL(blob);
            resolve({
              url: objectUrl,
              name,
              type,
            });
          };

          reader.onerror = (error) => {
            console.error("Error reading the encrypted file", error);
            setDownloadError("Failed to read the encrypted file.");
            setLoadingFiles(false);
            reject(error);
          };

          reader.readAsText(encryptedBlob);
        });

        decryptedFilesTemp.push(decryptedContent);
      }

      setDecryptedFiles(decryptedFilesTemp);
      setLoadingFiles(false);
    } catch (error) {
      console.error("Failed to retrieve or decrypt the files", error);
      setDownloadError("Failed to retrieve or decrypt the files.");
      setLoadingFiles(false);
    }
  };

  const handleApprove = async (reimbursementId) => {
    try {
      await verifyInsurancePublicIp(reimbursementId, true);
      // Refetch reimbursements
      const reimbs = await getInsuranceReimbursements(publicAddress);
      setReimbursements(reimbs);
      if (Array.isArray(reimbs)) {
        const reimbursementsWithDetails = await Promise.all(
          reimbs.map(async (reimbursement) => {
            const detailsArray = await getDocumentsByReimbursementId(
              reimbursement.reimbursementId
            );
            const details =
              detailsArray && detailsArray.length > 0 ? detailsArray[0] : {};
            return { ...reimbursement, ...details };
          })
        );
        setReimbursements(reimbursementsWithDetails);
      }
    } catch (error) {
      console.error("Failed to approve the claim", error);
    }
  };

  const handleReject = async (reimbursementId) => {
    try {
      await verifyInsurancePublicIp(reimbursementId, false);
      // Refetch reimbursements
      const reimbs = await getInsuranceReimbursements(publicAddress);
      setReimbursements(reimbs);
    } catch (error) {
      console.error("Failed to reject the claim", error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Insurance Claims
      </Typography>
      <Grid container spacing={4}>
        {Array.isArray(reimbursements) &&
          reimbursements.map((reimbursement, index) => {
            const totalSteps = 3;
            const completedSteps = [
              reimbursement.tpaPublicIpVerified,
              reimbursement.hospitalPublicVerified,
              reimbursement.insurancePublicIpVerified,
            ].filter(Boolean).length;
            const progress = (completedSteps / totalSteps) * 100;
            const isClaimActive = completedSteps === totalSteps;

            return (
              <Grid item xs={12} md={6} key={index}>
                <AnimatedCard
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main", marginRight: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        {reimbursement.claim || "No Title"}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="textSecondary">
                      <b>Reimbursement ID:</b> {reimbursement.reimbursementId}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <b>Amount:</b> {reimbursement.amount?.toString() || "N/A"}{" "}
                      ETH
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      <b>Document Hash:</b>{" "}
                      {reimbursement.documentHash || "N/A"}
                    </Typography>
                    {reimbursement.rejectionReason && (
                      <Typography variant="body1" color="error">
                        <b>Rejection Reason:</b> {reimbursement.rejectionReason}
                      </Typography>
                    )}

                    {/* Progress Bar */}
                    <ProgressContainer>
                      <ProgressConnector active={progress >= 50} />
                      <ProgressStep>
                        <Tooltip
                          title={`${reimbursement.tpaPublicIp || "N/A"}`}
                        >
                          <Avatar
                            sx={{
                              bgcolor: reimbursement.tpaPublicIpVerified
                                ? "success.main"
                                : "grey.300",
                              margin: "0 auto",
                            }}
                          >
                            <AccountBalanceIcon />
                          </Avatar>
                        </Tooltip>
                        <Typography variant="body2">TPA</Typography>
                      </ProgressStep>
                      <ProgressStep>
                        <Tooltip
                          title={`${reimbursement.hospitalPublicIp || "N/A"}`}
                        >
                          <Avatar
                            sx={{
                              bgcolor: reimbursement.hospitalPublicVerified
                                ? "success.main"
                                : "grey.300",
                              margin: "0 auto",
                            }}
                          >
                            <LocalHospitalIcon />
                          </Avatar>
                        </Tooltip>
                        <Typography variant="body2">Hospital</Typography>
                      </ProgressStep>
                      <ProgressStep>
                        <Tooltip
                          title={`${reimbursement.insurancePublicIp || "N/A"}`}
                        >
                          <Avatar
                            sx={{
                              bgcolor: reimbursement.insurancePublicIpVerified
                                ? "success.main"
                                : "grey.300",
                              margin: "0 auto",
                            }}
                          >
                            <BusinessIcon />
                          </Avatar>
                        </Tooltip>
                        <Typography variant="body2">Insurance</Typography>
                      </ProgressStep>
                    </ProgressContainer>

                    {/* Linear Progress Bar */}
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 10, borderRadius: 5 }}
                    />

                    {/* Final Status after Progress */}
                    {getFinalStatus(isClaimActive)}

                    {/* Approve/Reject Buttons */}
                    {!reimbursement.insurancePublicIpVerified &&
                      reimbursement.tpaPublicIpVerified &&
                      reimbursement.hospitalPublicVerified && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleApprove(reimbursement.reimbursementId)
                            }
                            sx={{ mr: 2 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() =>
                              handleReject(reimbursement.reimbursementId)
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      )}

                    {/* Download Button */}
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variant="contained"
                      color="primary"
                      startIcon={<GetAppIcon />}
                      onClick={() => {
                        setDownloadDialogOpen(true);
                        retrieveAndDecryptFile(reimbursement.documentHash);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Download Documents
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            );
          })}
      </Grid>

      {/* Download Dialog */}
      <Dialog
        open={downloadDialogOpen}
        onClose={() => {
          setDownloadDialogOpen(false);
          setDecryptedFiles([]);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Download Documents
          <IconButton
            aria-label="close"
            onClick={() => {
              setDownloadDialogOpen(false);
              setDecryptedFiles([]);
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingFiles ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : downloadError ? (
            <Typography color="error">{downloadError}</Typography>
          ) : decryptedFiles.length > 0 ? (
            decryptedFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {file.name}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GetAppIcon />}
                  onClick={() => {
                    // Create a temporary link to download the file
                    const link = document.createElement("a");
                    link.href = file.url;
                    link.setAttribute("download", file.name);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download
                </Button>
              </Box>
            ))
          ) : (
            <Typography>No documents available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDownloadDialogOpen(false);
              setDecryptedFiles([]);
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsuranceClaims;
