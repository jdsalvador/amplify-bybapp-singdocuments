// @ts-nocheck
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
//const LAMBDA_API_ENDPOINT = 'https://31leudvms4.execute-api.us-east-1.amazonaws.com/default/byb_handle_pdf_get_presigned_url'
const LAMBDA_API_ENDPOINT = 'https://09esn17m70.execute-api.us-east-1.amazonaws.com/inicio1/getpresigned'
const LAMBDA_API_PDF2PNG = 'https://0artc3ub2h.execute-api.us-east-1.amazonaws.com/stage1_pdf2png/pdf2png'
const URL_DEL_LLAMADO_2 = 'https://hdre13xc47.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_predict_png'
const URL_DEL_LLAMADO_3 = 'https://nk2no521ge.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_define_rect_png'
const URL_DEL_LLAMADO_4 = 'https://bc856r1pve.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_aplica_firma'

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
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handleUpload = async () => {
    setUploading(true);
    setError('');

    try {
      let archivos_subidos = [];
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14); // Genera yyyymmddHHMMSS
      console.log("Timestamp para subcarpeta:", timestamp); 
      const uploadResults = await Promise.all(selectedFiles.map(async (file) => {
        try {
          //console.log("enviando archivo")
          //console.log(file.name)

          let fileNameParts = file.name.split('.');
     
          if (fileNameParts.length > 1) {
            // Extrae la extensión y la convierte a minúsculas
            const extension = fileNameParts.pop().toLowerCase();
            // Une el resto para trabajar el nombre sin la extensión
            let fileNameWithoutExtension = fileNameParts.join('-');
            // Reemplaza cualquier punto restante en el nombre por un guión
            // Reemplaza caracteres que no son letras del alfabeto español, dígitos, guiones por nada
            fileNameWithoutExtension = fileNameWithoutExtension.replace(/[^a-zA-Z0-9-ñÑáéíóúÁÉÍÓÚüÜ_]/g, '');
            // Reconstruye el nombre del archivo con la extensión en minúsculas
            const fileNameProcessed = `${fileNameWithoutExtension}.${extension}`;
      
            //console.log(fileNameProcessed);

         

          
          // Obtener la URL prefirmada de Lambda
          const presignedResponse = await axios.post(LAMBDA_API_ENDPOINT, {
            folderName: timestamp,
            fileName: fileNameProcessed,//file.name,//`${timestamp}/${file.name}`,//file.name,
            fileType: file.type,
          },{
            // headers: {
            //   'Content-Type': 'application/json',
            //   "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            //   "Access-Control-Allow-Credentials" : true // Req
            // },
          });

       
          
          //const { url, fields } = presignedResponse.data.body;
          const url = presignedResponse.data.body.url;
          //console.log("la url es ")
          //console.log(url)
          // Crear el formulario con los campos requeridos para S3 y el archivo
          const formData = new FormData();
        //   Object.entries(fields).forEach((key: any, value: any) => {
        //     formData.append(key, value);
        //   });
          formData.append('file', file);

          // Subir el archivo a S3 usando la URL prefirmada
          //await axios.put(url, formData);
          try {
            const response = await axios.put(url, file, {
              headers: {
                'Content-Type': file.type, // Asegúrate de que este tipo de contenido coincida con el especificado al generar la URL presignada
              },
            });
            
            if (response.status === 200 || response.status === 204) {
              //console.log('Archivo subido con éxito');
              //console.log("Timestamp para subcarpeta v2:", timestamp); 
              archivos_subidos.push(file.name)

              try {
                console.log("Timestamp para subcarpeta v3:", timestamp); 
              const response_pdf2png = await axios.post(LAMBDA_API_PDF2PNG, 
              {
                  bucket_name:'bybappclasificadocsv1',
                  subfolder: timestamp,
                  pdf_key: fileNameProcessed
              }, {
              });

              //console.log("respuesta creacion png")
              //console.log(response_pdf2png)

            } catch (error) {
              console.error('Error al crear PNG en S3:', error);
            }



              // Aquí puedes realizar acciones adicionales, sabiendo que la subida fue exitosa
            }
          } catch (error) {
            console.error('Error al subir el archivo con put en S3:', error);
          }

          return { success: true, fileName: file.name };
        }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Puedes decidir cómo manejar los errores individuales aquí
          return { success: false, fileName: file.name };
        }
      }));



      console.log(archivos_subidos)

      try {
        const responseLlamado2 = await axios.post(URL_DEL_LLAMADO_2, {
          // Argumentos para el llamado 2, incluyendo el timestamp
          subfolder: timestamp,
          // Otros argumentos necesarios
        },{});
  
        // Aquí procesas la respuesta del llamado 2 si es necesario
        console.log("Respuesta del llamado 2", responseLlamado2.data);
        if (responseLlamado2.status === 200 || responseLlamado2.status === 204) {
          //console.log("Data del llamado 2", responseLlamado2.data.body);
          const clasifica_imagenes = JSON.parse(responseLlamado2.data.body)
          console.log(clasifica_imagenes)
          if (clasifica_imagenes.length > 0) {
            // Ahora el llamado 3, que puede depender de la respuesta del llamado 2
        const responseLlamado3 = await axios.post(URL_DEL_LLAMADO_3, {
          // Argumentos para el llamado 3, posiblemente basados en la respuesta del llamado 2
          subfolder: timestamp,
          imagenes: clasifica_imagenes
        },{});
  
            console.log("Respuesta del llamado 3", responseLlamado3.data);
            console.log(JSON.parse(responseLlamado3.data.body))
            
            
            if (responseLlamado3.status === 200 || responseLlamado3.status === 204) {
              const data_firmas = JSON.parse(responseLlamado3.data.body)
              if (data_firmas.length > 0) {
                const responseLlamado4 = await axios.post(URL_DEL_LLAMADO_4, {
                  // Argumentos para el llamado 4, posiblemente basados en la respuesta del llamado 3
                  subfolder: timestamp,
                  files: data_firmas,
                },{});
          
                    console.log("Respuesta del llamado 4 a", responseLlamado4.data);

                    if (responseLlamado4.status === 200 || responseLlamado4.status === 204) {
                      const resultado_firmas = JSON.parse(responseLlamado4.data.body)
                      console.log(resultado_firmas)
                     //if (resultado_firmas.length > 0) {
                        // uploadResponse.download_url = resultado_firmas.url_zip;
                        // uploadResponse.filesUploaded = resultado_firmas.pdf_firmados;
                        // uploadResponse.filesNoUploaded = resultado_firmas.pdf_no_firmados;

                        // console.log("uploadResponse.download_url")
                        // console.log(uploadResponse.download_url)

                        setUploadResponse({
                          download_url: resultado_firmas.url_zip,//uploadResults.filter(result => result.success).map(result => result.fileName),
                          pdf_firmados:resultado_firmas.pdf_firmados,
                          pdf_no_firmados:resultado_firmas.pdf_no_firmados
                        });





                      //}
                    }
              }
            }



          }
        }
  

  
        //console.log("Respuesta del llamado 3", responseLlamado3.data);
  
      } catch (error) {
        console.error('Error en los llamados posteriores:', error);
        // Manejar el error adecuadamente
      }









      // setUploadResponse({
      //   filesUploaded: archivos_subidos//uploadResults.filter(result => result.success).map(result => result.fileName),
      // });
    } catch (error) {
      console.error('Error during the upload process:', error);
      setError('Error uploading files');
    } finally {
      setUploading(false);
    }
  };



  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadCode('');
    setUploadResponse(null);
    setError('');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Firma documentos
      </Typography>

      {/* Conditionally render the upload form or the response */}
      {!uploadResponse ? (
        <>
        <InputContainer>
          {/* <StyledTextField
            label="Upload Code"
            value={uploadCode}
            onChange={(e) => setUploadCode(e.target.value)}
            variant="outlined"
          /> */}
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleUpload}
            //disabled={selectedFiles.length === 0 || !uploadCode.trim() || uploading}
            disabled={selectedFiles.length === 0 || uploading}
          >
            Enviar
          </StyledButton>
        </InputContainer>

          <Dropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Arrastra los archivos acá o presiona para buscarlos</p>
          </Dropzone>

          {uploading && <CircularProgress />}

          {selectedFiles.length > 0 && (
          <>
            <Typography variant="subtitle1">
              {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionados
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
            Comenzar otra vez
          </StyledButton>
          
          <Button
            variant="contained"
            color="primary"
            href={uploadResponse.download_url}
            style={{ marginTop: '1rem' }}
          >
            Descargar Zip
          </Button>
          <List>
    {uploadResponse.pdf_firmados.map((file, index) => (
        <ListItem key={index} style={{ alignItems: 'flex-start' }}>
            <CheckCircleIcon style={{ color: green[500] }} />
            <ListItemText primary={file.pdf_key} secondary={
                <img 
                    src={file.url_png_firma} 
                    alt={`Firma de ${file.pdf_key}`} 
                    style={{ maxHeight: '100px' }} 
                />
            } />
        </ListItem>
    ))}
    {uploadResponse.pdf_no_firmados.map((file, index) => (
        <ListItem key={index}>
            <ErrorIcon style={{ color: red[500] }} />
            <ListItemText primary={file.pdf_key} />
        </ListItem>
    ))}
</List>

        </>
      )}

  

      {error && (
        <Typography color="error">{error}</Typography>
      )}
    </Container>
  );
};

export default FileUpload;


