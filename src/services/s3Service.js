const AWS = require("aws-sdk");
const { logger } = require("../utils/logger");
require("dotenv").config();

const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

// Use MinIO endpoint in development
if (process.env.MINIO_ENDPOINT) {
  s3Config.endpoint = process.env.MINIO_ENDPOINT;
  s3Config.s3ForcePathStyle = true; // Required for MinIO
  s3Config.signatureVersion = "v4"; // MinIO compatibility
}

const s3 = new AWS.S3(s3Config);

const uploadProfileImg = async (userId, fileBuffer, fileType) => {
  const key = `profile-images/${userId}-${Date.now()}.${
    fileType.split("/")[1]
  }`; // e.g., profile-images/userId-timestamp.jpg
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const { Location } = await s3.upload(params).promise();
    logger.info("Profile image uploaded to storage", { userId, url: Location });
    return Location;
  } catch (error) {
    logger.error("Failed to upload profile image", {
      userId,
      error: error.message,
    });
    throw new Error("Failed to upload profile image");
  }
};

const uploadPropertyImg = async (userId, fileBuffer, fileType) => {
  const key = `property-media/${userId}-${Date.now()}.${
    fileType.split("/")[1]
  }`; // e.g., property-media/userId-timestamp.jpg
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const { Location } = await s3.upload(params).promise();
    logger.info("Property image uploaded to storage", {
      userId,
      url: Location,
    });
    return Location;
  } catch (error) {
    logger.error("Failed to upload property image", {
      userId,
      error: error.message,
    });
    throw new Error("Failed to upload property image");
  }
};

module.exports = { uploadProfileImg, uploadPropertyImg };
