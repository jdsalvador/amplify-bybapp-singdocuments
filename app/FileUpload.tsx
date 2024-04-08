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


const API_PROCESS = 'https://dhns872rqh.execute-api.us-east-1.amazonaws.com/test_1/files';
//const LAMBDA_API_ENDPOINT = 'https://31leudvms4.execute-api.us-east-1.amazonaws.com/default/byb_handle_pdf_get_presigned_url'
const LAMBDA_API_ENDPOINT = 'https://09esn17m70.execute-api.us-east-1.amazonaws.com/inicio1/getpresigned'
const LAMBDA_API_PDF2PNG = 'https://0artc3ub2h.execute-api.us-east-1.amazonaws.com/stage1_pdf2png/pdf2png'
const URL_DEL_LLAMADO_2 = 'https://hdre13xc47.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_predict_png'
const URL_DEL_LLAMADO_3 = 'https://nk2no521ge.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_define_rect_png'
const URL_DEL_LLAMADO_4 = 'https://bc856r1pve.execute-api.us-east-1.amazonaws.com/default/byb_v1_handle_pdf_aplica_firma'

const vibrantPrimary = '#ff4081'; // Example vibrant color
const vibrantSecondary = '#80bced'; // Example secondary color

const Container = styled('div')({
  minHeight:'100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  color: '#333', // Use a darker color for text for better readability
  backgroundColor: 'rgba(240, 240, 240,0.4)'//'rgba(255,148,112,0.4)',
});

const Dropzone = styled('div')({
  minWidth: '40vw',
  minHeight: '15vh',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: '2px',
  borderRadius: '8px',
  borderColor: vibrantPrimary,
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: 'black',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
  marginBottom: '20px',
});

const ResetButton = styled(Button)(({ theme }) => ({
  marginTop: '1rem',
  marginBottom: '1rem',
  border: `1px solid `,
  backgroundColor: 'grey',//vibrantPrimary, // Vibrant color for the button
  color: 'white', // White text on colored button
  '&:hover': {
    backgroundColor: vibrantSecondary, // Different vibrant color on hover
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '40vw',
  minHeight: '10vh',
  marginTop: '1rem',
  marginBottom: '1rem',
  border: `1px solid `,
  backgroundColor: '#74BDCB',//vibrantPrimary, // Vibrant color for the button
  color: 'white', // White text on colored button
  '&:hover': {
    backgroundColor: vibrantSecondary, // Different vibrant color on hover
  },
}));

const ResetContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
});

const InputContainer = styled('div')({
  minWidth: '90vw',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  marginBottom: '20px',
  backgroundColor: '#E78895',//'rgba(255,148,112,1)',
  borderWidth: '2px',
  borderRadius: '20px',
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
  // Estado del componente
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCode, setUploadCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [error, setError] = useState('');


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(
      file => file.type === 'application/pdf' && file.size > 0 && !selectedFiles.some(existingFile => existingFile.name === file.name)
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
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    console.log("timestamp")
    console.log(timestamp)
    try {
      // Fase 1: Subida de archivos
      await Promise.all(selectedFiles.map(file => uploadFile(file, timestamp)));

      //console.log("selectedFiles")
      //console.log(selectedFiles)
      const resultadosSegundoLlamado = await Promise.all(selectedFiles.map(file => segundoLlamado(timestamp, file.name)));

      //console.log("resultadosSegundoLlamado")
      //console.log(resultadosSegundoLlamado)

      const resultadosTercerLlamado = await Promise.all(resultadosSegundoLlamado.map(file => tercerLlamado(timestamp, file.png_key, file.rotacion_pages)));

      console.log("resultadosTercerLlamado")
      console.log(resultadosTercerLlamado)

      const resultadosCuartoLlamado = await Promise.all(resultadosTercerLlamado.map(file => cuartoLlamado(timestamp, file.image_key, file.class, file.subclass, file.rotaciones)));

      console.log("resultadosCuartoLlamado")
      console.log(resultadosCuartoLlamado)

      const resultadosQuintoLlamado = await Promise.all(resultadosCuartoLlamado.map(file => quintoLlamado(timestamp, file.image_key, file.clase, file.subclase, file.rotaciones, file.tipo, file.numpagina, file.rect_img, file.rect_a, file.rect_c)));

      // console.log("resultadosQuintoLlamado")
      // console.log(resultadosQuintoLlamado)

      const resultadosSextoLlamado = await sextoLlamado(timestamp)

      // console.log("resultadosSextoLlamado")
      // console.log(resultadosSextoLlamado)
      setUploadResponse({
        download_url: resultadosSextoLlamado.url_zip,//uploadResults.filter(result => result.success).map(result => result.fileName),
        pdf_firmados: resultadosQuintoLlamado.filter(elem => {
          if (elem.firmado === true) {
            return elem.pdf_key
          }
        }),
        pdf_no_firmados: resultadosQuintoLlamado.filter(elem => {
          if (elem.firmado === false) {
            return elem.pdf_key
          }
        }),
      });

      // Las siguientes fases serían similares, adaptadas según tus necesidades
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

  function processFileName(fileName) {
    let fileNameParts = fileName.split('.');
    const extension = fileNameParts.pop().toLowerCase();
    let fileNameWithoutExtension = fileNameParts.join('-').replace(/[^a-zA-Z0-9-ñÑáéíóúÁÉÍÓÚüÜ_]/g, '');
    return `${fileNameWithoutExtension}.${extension}`;
  }

  async function uploadFile(file: File, timestamp: string) {
    try {

      let fileNameParts = file.name.split('.');
      let fileNameProcessed;

      // if (fileNameParts.length > 1) {
      //   // Extrae la extensión y la convierte a minúsculas
      //   const extension = fileNameParts.pop().toLowerCase();
      //   // Une el resto para trabajar el nombre sin la extensión
      //   let fileNameWithoutExtension = fileNameParts.join('-');
      //   // Reemplaza cualquier punto restante en el nombre por un guión
      //   // Reemplaza caracteres que no son letras del alfabeto español, dígitos, guiones por nada
      //   fileNameWithoutExtension = fileNameWithoutExtension.replace(/[^a-zA-Z0-9-ñÑáéíóúÁÉÍÓÚüÜ_]/g, '');
      //   // Reconstruye el nombre del archivo con la extensión en minúsculas
      //   fileNameProcessed = `${fileNameWithoutExtension}.${extension}`;
      // }
      // Paso 1: Obtener la URL presignada del servidor
      const responsePresign = await axios.post(LAMBDA_API_ENDPOINT, {
        // Aquí envías la información necesaria para obtener la URL presignada
        folderName: timestamp,
        fileName: processFileName(file.name),//file.name,//`${timestamp}/${file.name}`,//file.name,
        fileType: file.type,
      });
      //console.log(responsePresign.data.body.url)
      // Asegúrate de que la respuesta contiene la URL presignada
      if (responsePresign.status === 200) {
        const url = responsePresign.data.body.url;

        // Paso 2: Usar la URL presignada para subir el archivo
        const responseUpload = await axios.put(url, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        // Verificar si la subida fue exitosa
        if (responseUpload.status === 200) {
          console.log(`Archivo ${file.name} subido con éxito.`);
          return {
            success: true,
            message: `Archivo ${file.name} subido con éxito.`,
            fileName: file.name,
          };
        } else {
          console.error(`Error al subir el archivo ${file.name}.`);
          return {
            success: false,
            message: `Error al subir el archivo ${file.name}.`,
            fileName: file.name,
          };
        }
      } else {
        console.error('No se pudo obtener una URL presignada para la subida del archivo.');
        return {
          success: false,
          message: 'No se pudo obtener una URL presignada para la subida del archivo.',
        };
      }
    } catch (error) {
      console.error(`Error al subir el archivo ${file.name}:`, error);
      return {
        success: false,
        message: `Error al subir el archivo ${file.name}: ${error}`,
      };
    }
  }


  async function segundoLlamado(timestamp: string, fileName: string) {
    try {
      // Aquí construyes el payload del POST basándote en los requisitos de tu API
      const payload = {
        bucket_name: 'bybappclasificadocsv1',
        subfolder: timestamp,
        pdf_key: processFileName(fileName)
      };

      // Realizar el llamado POST al segundo endpoint
      const response = await axios.post(LAMBDA_API_PDF2PNG, payload);

      // Verificar la respuesta
      if (response.status === 200) {
        console.log(`El procesamiento del segundo llamado para el archivo ${fileName} fue exitoso.`);
        // Devuelve algún dato de interés de la respuesta, si es necesario
        // return {
        //     //success: true,
        //     data: JSON.parse(response.data.body), // Asumiendo que quieres retornar algo de la respuesta
        // };
        return JSON.parse(response.data.body)
      } else {
        console.error(`Error en el segundo llamado para el archivo ${fileName}.`);
        return {
          success: false,
          message: `Error en el segundo llamado para el archivo ${fileName}.`,
        };
      }
    } catch (error) {
      console.error(`Error en el segundo llamado para el archivo ${fileName}:`, error);
      return {
        success: false,
        message: `Error en el segundo llamado para el archivo ${fileName}: ${error}`,
      };
    }
  }


  async function tercerLlamado(timestamp: string, fileName: string, rotaciones: Array) {
    try {
      // Aquí construyes el payload del POST basándote en los requisitos de tu API
      const payload = {
        subfolder: timestamp,
        image_key: fileName,
        rotaciones: rotaciones
      };

      // Realizar el llamado POST al tercer endpoint
      const response = await axios.post(URL_DEL_LLAMADO_2, payload);

      console.log(response)

      // Verificar la respuesta
      if (response.status === 200) {
        console.log(`El procesamiento del tercer llamado para el archivo ${fileName} fue exitoso.`);
        // Devuelve algún dato de interés de la respuesta, si es necesario
        // return {
        //     success: true,
        //     data: JSON.parse(response.data.body), // Asumiendo que quieres retornar algo de la respuesta
        // };
        return JSON.parse(response.data.body)
      } else {
        console.error(`A Error en el tercer llamado para el archivo ${fileName}.`);

        return {
          success: false,
          message: `A Error en el tercer llamado para el archivo ${fileName}.`,
        };
      }
    } catch (error) {
      console.error(`B Error en el tercer llamado para el archivo ${fileName}:`, error);
      return {
        success: false,
        message: `B Error en el tercer llamado para el archivo ${fileName}: ${error}`,
      };
    }
  }


  async function cuartoLlamado(timestamp: string, fileName: string, fileClass: string, fileSubclass: string, rotaciones: Array) {
    try {
      // Aquí construyes el payload del POST basándote en los requisitos de tu API
      const payload = {
        subfolder: timestamp,
        image_key: fileName,
        class: fileClass,
        subclass: fileSubclass,
        rotaciones: rotaciones
      };

      // Realizar el llamado POST al cuarto endpoint
      const response = await axios.post(URL_DEL_LLAMADO_3, payload);

      console.log(response)

      // Verificar la respuesta
      if (response.status === 200) {
        console.log(`El procesamiento del cuarto llamado para el archivo ${fileName} fue exitoso.`);
        // Devuelve algún dato de interés de la respuesta, si es necesario
        // return {
        //     success: true,
        //     data: JSON.parse(response.data.body), // Asumiendo que quieres retornar algo de la respuesta
        // };
        return JSON.parse(response.data.body)
      } else {
        console.error(`A Error en el cuarto llamado para el archivo ${fileName}.`);

        return {
          success: false,
          message: `A Error en el cuarto llamado para el archivo ${fileName}.`,
        };
      }
    } catch (error) {
      console.error(`B Error en el cuarto llamado para el archivo ${fileName}:`, error);
      return {
        success: false,
        message: `B Error en el cuarto llamado para el archivo ${fileName}: ${error}`,
      };
    }
  }

  async function quintoLlamado(timestamp: string, fileName: string, fileClass: string, fileSubclass: string, rotaciones: Array, tipo: string, numpagina: number, rect_img: Array, rect_a: Array, rect_c: Array) {
    try {
      // Aquí construyes el payload del POST basándote en los requisitos de tu API
      const payload = {
        subfolder: timestamp,
        url_zip: false,
        image_key: fileName,
        class: fileClass,
        subclass: fileSubclass,
        rotaciones: rotaciones,
        tipo: tipo,
        numpagina: numpagina,
        rect_img: rect_img,
        rect_a: rect_a,
        rect_c: rect_c
      };

      console.log("payload 5 firmar")
      console.log(payload)

      // Realizar el llamado POST al quinto endpoint
      const response = await axios.post(URL_DEL_LLAMADO_4, payload);

      console.log(response)

      // Verificar la respuesta
      if (response.status === 200) {
        console.log(`El procesamiento del quinto llamado para el archivo ${fileName} fue exitoso.`);
        // Devuelve algún dato de interés de la respuesta, si es necesario
        // return {
        //     success: true,
        //     data: JSON.parse(response.data.body), // Asumiendo que quieres retornar algo de la respuesta
        // };
        const resultado_firma = JSON.parse(response.data.body)
        console.log(resultado_firma)
        let firmado = false
        let pdf_key = ''
        let url_png_firma = ''
        let rotaciones = [0, 0]
        let clase = ''
        let subclase = ''
        if (resultado_firma.pdf_firmados.length > 0) {
          firmado = true
          pdf_key = resultado_firma.pdf_firmados[0].pdf_key
          url_png_firma = resultado_firma.pdf_firmados[0].url_png_firma
          clase = resultado_firma.pdf_firmados[0].class
          subclase = resultado_firma.pdf_firmados[0].subclass
          rotaciones = resultado_firma.pdf_firmados[0].rotaciones
        }
        else {
          pdf_key = resultado_firma.pdf_no_firmados[0].pdf_key
        }
        return { pdf_key: pdf_key, firmado: firmado, url_png_firma: url_png_firma, clase: clase, subclase: subclase, rotaciones: rotaciones }
      } else {
        console.error(`A Error en el quinto llamado para el archivo ${fileName}.`);

        return {
          success: false,
          message: `A Error en el quinto llamado para el archivo ${fileName}.`,
        };
      }
    } catch (error) {
      console.error(`B Error en el quinto llamado para el archivo ${fileName}:`, error);
      return {
        success: false,
        message: `B Error en el quinto llamado para el archivo ${fileName}: ${error}`,
      };
    }
  }


  async function sextoLlamado(timestamp: string) {
    try {
      // Aquí construyes el payload del POST basándote en los requisitos de tu API
      const payload = {
        subfolder: timestamp,
        url_zip: true
      };

      // console.log("payload 6")
      // console.log(payload)

      // Realizar el llamado POST al sexto endpoint
      const response = await axios.post(URL_DEL_LLAMADO_4, payload);

      console.log(response)

      // Verificar la respuesta
      if (response.status === 200) {
        console.log(`El procesamiento del sexto llamado para el archivo ${timestamp} fue exitoso.`);
        // Devuelve algún dato de interés de la respuesta, si es necesario
        // return {
        //     success: true,
        //     data: JSON.parse(response.data.body), // Asumiendo que quieres retornar algo de la respuesta
        // };
        const resultado_url = JSON.parse(response.data.body)
        console.log(resultado_url)

        return resultado_url
      } else {
        console.error(`A Error en el sexto llamado para el archivo ${timestamp}.`);

        return {
          success: false,
          message: `A Error en el sexto llamado para el archivo ${timestamp}.`,
        };
      }
    } catch (error) {
      console.error(`B Error en el sexto llamado para el archivo ${timestamp}:`, error);
      return {
        success: false,
        message: `B Error en el sexto llamado para el archivo ${timestamp}: ${error}`,
      };
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        ByB / Firma documentos
      </Typography>

      {/* Conditionally render the upload form or the response */}
      {!uploadResponse ? (
        <>
<ResetContainer>
<ResetButton
              variant="outlined"
              color="secondary"
              onClick={resetUpload}
              style={{ marginTop: '1rem' }}
            >
              Resetear
            </ResetButton>

            </ResetContainer>
          <InputContainer>
            {/* <StyledTextField
            label="Upload Code"
            value={uploadCode}
            onChange={(e) => setUploadCode(e.target.value)}
            variant="outlined"
          /> */}





      

          <Dropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Arrastra los archivos aquí o presiona para buscarlos</p>
          </Dropzone>


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
                  file.clase + " / " + file.subclase
                } />
                <ListItemText primary={

                  <img
                    src={file.url_png_firma}
                    alt={`Firma de ${file.pdf_key}`}
                    style={{ maxHeight: '100px' }}
                  />

                }
                  secondary={file.rotaciones[0] + " " + file.rotaciones[1]} />
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


