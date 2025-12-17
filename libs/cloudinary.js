import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary using env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadImage(filePathOrDataUri, folder = "gigs") {
  return cloudinary.uploader.upload(filePathOrDataUri, {
    folder,
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
}

export function deleteImage(publicId) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
