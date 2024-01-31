import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent, Stack, TextField, Button, LinearProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
});

export const UploadNews = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      image: null,
      title: '',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      const formData = new FormData();
      if (values.image) {
        formData.append('image_file', values.image);
      }

      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('title', values.title);
      formData.append('description', values.description);

      setIsLoading(true);

      fetch('https://devo-casa-de-mi-padre.onrender.com/upload-news', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        resetForm();
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    },
  });

  const handleImageChange = (event:any) => {
    formik.setFieldValue("image", event.currentTarget.files[0]);
  };
  const handleButtonClick = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader title="Upload News" />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <input
              accept="image/*"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
            >
              Select Image
            </Button>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            {isLoading && <LinearProgress />}
            <Button color="primary" variant="contained" type="submit" disabled={isLoading}>
              Upload
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};
