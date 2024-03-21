import React, { FC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { FileDropzone } from 'src/components/file-dropzone';
import { FileWithPath } from 'react-dropzone';

interface FileUploaderProps {
  onClose?: () => void;
  open?: boolean;
}

export const FileUploader: FC<FileUploaderProps> = ({ onClose, open = false }) => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    setFiles([]);
    setUploadProgress(0);
  }, [open]);

  const handleDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const handleRemove = useCallback((file: FileWithPath): void => {
    setFiles((prevFiles) => prevFiles.filter((_file) => _file.path !== file.path));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleUpload = async () => {
    const formData = new FormData();
  
    files.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });

    try {
      const response = await axios.post('https://devo-casa-de-mi-padre.onrender.com/devocional', formData, {
        headers: {
          'Accept':'*/*',
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (response.status === 200) {
        onClose?.();
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={3} sx={{ px: 3, py: 2 }}>
        <Typography variant="h6">Upload Files</Typography>
        <IconButton color="inherit" onClick={onClose}>
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        <FileDropzone
            accept={{
              'audio/*': [], // Accept all audio types without specifying extensions
              'image/*': [], // Accept all image types without specifying extensions
              'video/*': [], // Accept all video types without specifying extensions
              'application/*': [], // Accept all application types without specifying extensions
              'text/*': [], // Accept all text types without specifying extensions
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/pdf': ['.pdf']
            }} // Allow all file types
          caption="Max file size is 500 MB"
          files={files}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          onUpload={handleUpload}
        />
        {uploadProgress > 0 && (
          <LinearProgress variant="determinate" value={uploadProgress} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
