const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const multer = require('multer');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files
app.use(cors());

// Load environment variables from .env file
dotenv.config();

// Set up Vultr credentials and region from environment variables
AWS.config.update({
  accessKeyId: process.env.Vultr_ACCESS_KEY_ID,
  secretAccessKey: process.env.Vultr_SECRET_ACCESS_KEY,
  region: process.env.Vultr_REGION,
  endpoint: process.env.Vultr_ENDPOINT,
});

// Create an S3 instance
const s3 = new AWS.S3();

// Function to upload a single image to S3
function uploadImageToS3(bucketName, imageName, imagePath) {
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: fs.createReadStream(imagePath),
    ACL: 'public-read', // This makes the image publicly accessible
  };

  return s3.upload(params).promise();
}

// API route to handle image uploads
app.post('/upload-images', upload.array('images', 5), async (req, res) => {
  const bucketName = process.env.Vultr_BUCKET_NAME;
  const uploadedImages = [];

  try {
    // Upload images one by one
    const imageUploadPromises = req.files.map((file, index) => {
      return uploadImageToS3(bucketName, `image${index + 1}.jpg`, file.path)
        .then((uploadedImage) => {
          uploadedImages.push(uploadedImage.Location);
        })
        .catch((err) => {
          console.error('Error uploading an image:', err);
        });
    });

    // Wait for all uploads to finish
    await Promise.all(imageUploadPromises);

    console.log('Images uploaded successfully:');
    console.log(uploadedImages);

    res.json({ message: 'Images uploaded successfully', uploadedImages });
  } catch (err) {
    console.error('Error uploading images:', err);
    res.status(500).json({ error: 'Error uploading images' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
