import multer from "multer";
import path from "path";
import fs from "fs";

// Helper: Create directory if not exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export const dynamicFileUpload = (folderName: string) => {
  const uploadPath = path.join(__dirname, `../../uploads/${folderName}`);
  ensureDir(uploadPath);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
      const timestamp = Date.now();
      cb(null, `${name}-${timestamp}${ext}`);
    },
  });

  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  };

  return multer({ storage, fileFilter });
};
