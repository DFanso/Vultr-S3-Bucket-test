const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Set up AWS credentials and region from environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
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

// Function to upload multiple images
async function uploadImages() {
  const bucketName = process.env.AWS_BUCKET_NAME;

  try {
    // Upload images one by one
    const imageUploadPromises = [];
    imageUploadPromises.push(uploadImageToS3(bucketName, 'image1.jpg', 'path/to/image1.jpg'));
    imageUploadPromises.push(uploadImageToS3(bucketName, 'image2.jpg', 'path/to/image2.jpg'));
    imageUploadPromises.push(uploadImageToS3(bucketName, 'image3.jpg', 'path/to/image3.jpg'));
    imageUploadPromises.push(uploadImageToS3(bucketName, 'image4.jpg', 'path/to/image4.jpg'));
    imageUploadPromises.push(uploadImageToS3(bucketName, 'image5.jpg', 'path/to/image5.jpg'));

    // Wait for all uploads to finish
    const uploadedImages = await Promise.all(imageUploadPromises);

    console.log('Images uploaded successfully:');
    uploadedImages.forEach((image) => {
      console.log(image.Location);
    });
  } catch (err) {
    console.error('Error uploading images:', err);
  }
}

uploadImages();
