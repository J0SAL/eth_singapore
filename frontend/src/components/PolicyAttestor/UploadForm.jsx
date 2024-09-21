// src/PolicyUploadForm.js
import React, { useState } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload,
  Send,
  Description as DescriptionIcon,
  Title as TitleIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import Firebase services
import { storage, db } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#ffffffdd',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  backdropFilter: 'blur(5px)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&:after': {
    content: '""',
    background: theme.palette.secondary.main,
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    transition: 'all 0.3s',
    zIndex: -1,
  },
  '&:hover:after': {
    left: 0,
  },
  '&:hover': {
    color: '#fff',
  },
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const PolicyUploadForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const documents = watch('documents') || [];

  const onSubmit = async (data) => {
    try {
      // Upload files to Firebase Storage and get download URLs
      const fileUploadPromises = Array.from(data.documents).map(async (file) => {
        const storageRef = ref(storage, `policies/${file.name}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          name: file.name,
          url: downloadURL,
        };
      });

      const uploadedFiles = await Promise.all(fileUploadPromises);

      // Create a document in Firestore
      await addDoc(collection(db, 'policies'), {
        policyName: data.policyName,
        policyDescription: data.policyDescription,
        uploadedAt: Timestamp.now(),
        files: uploadedFiles,
      });

      // Show success message
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error uploading policy:', error);
      // Optionally, display an error message to the user
    }
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
          style={{ minHeight: '100vh' }}
        >
          {/* Left Side - Image */}
          <Grid item xs={12} md={6}>
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW5zdXJhbmNlfGVufDB8fDB8fHww"
              alt="Policy Upload"
              style={{ width: '100%', height: 'auto' }}
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
                <b>Policy Upload Form</b>
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Policy Name"
                  variant="outlined"
                  fullWidth
                  required
                  error={!!errors.policyName}
                  helperText={errors.policyName ? 'Policy Name is required' : ''}
                  {...register('policyName', { required: true })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Policy Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  error={!!errors.policyDescription}
                  helperText={
                    errors.policyDescription ? 'Description is required' : ''
                  }
                  {...register('policyDescription', { required: true })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Upload Policy Document
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUpload />}
                      color="secondary"
                    >
                      Choose File
                      <input
                        type="file"
                        name="documents"
                        hidden
                        multiple
                        {...register('documents', { required: true })}
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
                  Upload Policy
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
            sx={{ width: '100%' }}
          >
            Policy document uploaded successfully!
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </>
  );
};

export default PolicyUploadForm;
