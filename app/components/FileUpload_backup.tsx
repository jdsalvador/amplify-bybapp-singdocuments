// components/FileUpload.tsx
'use client';

import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { green, red, grey } from '@mui/material/colors';


const API_PROCESS='https://dhns872rqh.execute-api.us-east-1.amazonaws.com/test_1/files';

const vibrantPrimary = '#ff4081'; // Example vibrant color
const vibrantSecondary = '#80bced'; // Example secondary color

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  color: '#333', // Use a darker color for text for better readability
});

const Dropzone = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: '2px',
  borderRadius: '2px',
  borderColor: vibrantPrimary,
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
  marginBottom: '20px',
});

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: '1rem',
  marginBottom: '1rem',
  border: `1px solid `,
  backgroundColor: vibrantPrimary, // Vibrant color for the button
  color: 'green', // White text on colored button
  '&:hover': {
    backgroundColor: vibrantSecondary, // Different vibrant color on hover
  },
}));

const InputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
});

const StyledTextField = styled(TextField)({
  // Add vibrant border color and focus style
  '& label.Mui-focused': {
    color: vibrantPrimary,
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: vibrantPrimary,
    },
  },
  marginRight: '1rem',
  flexGrow: 1,
});


const FileUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCode, setUploadCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState('');
  const [upload_files, setUploadFiles] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-empty PDF files and duplicates
    const newFiles = acceptedFiles.filter(
      (file) => file.type === 'application/pdf' && file.size > 0 && !selectedFiles.some(existingFile => existingFile.name === file.name)
    );
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [selectedFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.pdf',
  });

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    //formData.append('code', uploadCode);

    try {
      const response = await axios.post(API_PROCESS, formData, {
        // headers: {
        //   'Content-Type': 'multipart/json',
        // },
      });
      
      // Assuming the server responds with the necessary details
      console.log("response")
      console.log(response)
      if (response.data.statusCode === 403) {
        setError('Code is not correct');
      } else {
        const responseBody = JSON.parse(response.data.body);
        setUploadResponse({
          filesPassed: responseBody.filesPassed,
          filesFailed: responseBody.filesFailed,
          download_url: responseBody.download_url,
          upload_files: responseBody.upload_files
        });
      }
    } catch (error) {
      console.log("error a");
      console.error(error);
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  // const handleUpload = async () => {
  //   setUploading(true);
  //   setError('');
  //   const formData = new FormData();
  //   selectedFiles.forEach((file) => {
  //     formData.append('files', file);
  //   });
  //   formData.append('code', uploadCode);

  //   try {
  //     const response = await axios.post(API_PROCESS, JSON.stringify({ files: selectedFiles, code: uploadCode }), {
  //       headers: {
  //         'Content-Type': 'multipart/json',
  //       },
  //     });
      
  //     // Assuming the server responds with the necessary details
  //     console.log("response")
  //     console.log(response)
  //     if (response.data.statusCode === 403) {
  //       setError('Code is not correct');
  //     } else {
  //       const responseBody = JSON.parse(response.data.body);
  //       setUploadResponse({
  //         filesPassed: responseBody.filesPassed,
  //         filesFailed: responseBody.filesFailed,
  //         download_url: responseBody.download_url,
  //         upload_files: responseBody.upload_files
  //       });
  //     }
  //   } catch (error) {
  //     console.log("error a");
  //     console.error(error);
  //     setError('Error uploading file');
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadCode('');
    setUploadResponse(null);
    setError('');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        File Upload
      </Typography>

      {/* Conditionally render the upload form or the response */}
      {!uploadResponse ? (
        <>
        <InputContainer>
          <StyledTextField
            label="Upload Code"
            value={uploadCode}
            onChange={(e) => setUploadCode(e.target.value)}
            variant="outlined"
          />
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || !uploadCode.trim() || uploading}
          >
            Submit
          </StyledButton>
        </InputContainer>

          <Dropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drag and drop some files here, or click to select files</p>
          </Dropzone>

          {selectedFiles.length > 0 && (
          <>
            <Typography variant="subtitle1">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </>
        )}
        </>
      ) : (
        <>

<StyledButton
            variant="outlined"
            color="secondary"
            onClick={resetUpload}
            style={{ marginTop: '1rem' }}
          >
            Start Over
          </StyledButton>
          
          <Button
            variant="contained"
            color="primary"
            href={uploadResponse.download_url}
            style={{ marginTop: '1rem' }}
          >
            Download Zip
          </Button>
          <List>
          {uploadResponse.upload_files.map((file, index) => (
              <ListItem key={index}>
                <CheckCircleIcon style={{ color: green[500] }} />
                <ListItemText primary={file} />
              </ListItem>
            ))}
            
            {uploadResponse.filesPassed.map((file, index) => (
              <ListItem key={index}>
                <CheckCircleIcon style={{ color: green[500] }} />
                <ListItemText primary={file} />
              </ListItem>
            ))}
            {uploadResponse.filesFailed.map((file, index) => (
              <ListItem key={index}>
                <ErrorIcon style={{ color: red[500] }} />
                <ListItemText primary={file} />
              </ListItem>
            ))}
          </List>

        </>
      )}

      {uploading && <CircularProgress />}

      {error && (
        <Typography color="error">{error}</Typography>
      )}
    </Container>
  );
};

export default FileUpload;


