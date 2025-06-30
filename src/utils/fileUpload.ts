import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Saves a base64 image to /uploads/profile_images and returns the relative path.
 * @param base64Image - The base64 image string
 * @returns The relative file path (e.g. "uploads/profile_images/abc.png")
 */
export const saveBase64Image = (
  base64Image: string,
  folder_name: string
): string => {
  if (!base64Image) {
    throw new Error("No base64 image provided");
  }

  // Generate unique filename
  const fileName = `${uuidv4()}.png`;
  const dirPath = path.join(process.cwd(), "uploads", folder_name);
  const filePath = path.join(dirPath, fileName);

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Remove Base64 prefix if exists
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // Save file
  fs.writeFileSync(filePath, base64Data, "base64");

  // Return relative path
  return `uploads/${folder_name}/${fileName}`;
};

export const uploadBase64ImageToS3 = async (
  base64Image: string,
  folderName: string
): Promise<string> => {
  if (!base64Image) {
    throw new Error("No base64 image provided");
  }

  // Strip prefix and get buffer
  const [, data] = base64Image.split(";base64,");
  if (!data) {
    throw new Error("Invalid base64 image string");
  }
  const buffer = Buffer.from(data, "base64");

  // Generate unique key
  const extensionMatch = base64Image.match(/data:image\/(\w+);base64,/);
  const ext = extensionMatch ? extensionMatch[1] : "png";
  const fileName = `${uuidv4()}.${ext}`;
  const key = `${folderName}/${fileName}`;

  // Create S3 client
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Upload
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: `image/${ext}`,
      ACL: "public-read", // or your preferred ACL
    })
  );

  // Return the S3 key; you can construct the URL in your response or store the key
  return key;
};
