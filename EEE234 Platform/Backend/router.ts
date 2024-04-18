import express from "express";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const folderPath: string = "/Users/Lankiman/Desktop/ExamSubmisions";

const namingPattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2})|(\d{8}[A-Za-z]{2}))_[A-Z][a-z]+(-[a-zA-Z][a-z]+)?(_[A-Z][a-z]+(-[a-zA-Z][a-z]+)?){1,2}(-[a-zA-Z][a-z]+)?\.c/;

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, `${folderPath}`);
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
    if (fileExtension !== ".c") {
      return cb(new Error("Only text  files with .cextensions are allowed"));
    }

    console.log(file.mimetype);
    if (!namingPattern.test(file.originalname)) {
      return cb(new Error("Incorrect Naming Format"));
    }
    console.log(file.originalname);

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

router.post("/", handleFileUpload, validateUploadStatus);

export default router;
