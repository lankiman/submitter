import { NextFunction, Request, Response } from "express";
// import fs from "fs";
import multer from "multer";
import path from "path";

const folderPath: string = "../../../submissions/";
const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(_[1-9]\.py|\.mp4)$/;

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    const { dept } = req.params;
    cb(null, `${folderPath}/${dept}`);
  },
  filename: function (req: Request, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const validExtensions = [".py", ".mp4"];
    if (!validExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          "Only text or video files with .py or .mp4 extensions are allowed"
        )
      );
    }
    switch (fileExtension) {
      case ".py":
        if (!file.mimetype.startsWith("/text")) {
          return cb(new Error("Files with .py Extension must a Text File"));
        }
        break;
      case ".mp4":
        if (!file.mimetype.startsWith("/text")) {
          return cb(new Error("Files with .mp4 Extension must a Video File"));
        }
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

const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
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

export { handleFileUpload, validateUploadStatus };
