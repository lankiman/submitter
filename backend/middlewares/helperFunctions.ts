import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

const storageHelper = (folderPath: string, dept: boolean) => {
  const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
      if (dept) {
        const { dept } = req.params;
        cb(null, `${folderPath}/${dept}`);
      } else {
        cb(null, `${folderPath}`);
      }
    },
    filename: function (req: Request, file, cb) {
      cb(null, file.originalname);
    }
  });
  return storage;
};

const uploadHelper = (
  storage: multer.StorageEngine,
  validExtensions: string[],
  platform: string,
  namePattern: RegExp
) => {
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 104860000
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        if (platform == "c") {
          return cb(
            new Error(
              "Only text or video files with .c, .h or .mp4 extensions are allowed"
            )
          );
        } else {
          return cb(
            new Error(
              "Only text or video files with .py and .mp4 extensions are allowed"
            )
          );
        }
      }
      switch (fileExtension) {
        case ".c":
          console.log(file.mimetype);
          break;
        case ".mp4":
          console.log(file.mimetype);
          break;
        case ".h":
          console.log(file.mimetype);
          break;
        case ".py":
          console.log(file.mimetype);
          break;
        default:
          break;
      }

      if (!namePattern.test(file.originalname)) {
        return cb(new Error("Incorrect Naming Format"));
      }

      cb(null, true);
    }
  });
  return upload;
};

const handleFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
  upload: multer.Multer
) => {
  upload.array("file")(req, res, (err: multer.MulterError | any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload failed." });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const validateUploadStatus = (req: Request, res: Response) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ error: "No file uploaded, please choose a file to upload" });
  }
  console.log("upload sucessful");
  res.status(200).json({ message: "upload successful", body: req.files });
};

export { storageHelper, uploadHelper, handleFileUpload, validateUploadStatus };
