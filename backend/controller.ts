import { Request, Response } from "express";
// import fs from "fs";
import multer from "multer";
import path from "path";

const folderPath: string = "../../../submissions/";
const namePattern = /^UG\/\d{2}\/\d{4}_[A-Za-z]+_[A-Za-z]+$/;

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
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },

  fileFilter: (req, file, cb) => {
    // Check file type and reject if not a .py file
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (fileExtension !== ".py") {
      cb(null, false);
      cb(new Error("Only .py files are allowed"));
    }
    if (!namePattern.test(file.originalname)) {
      cb(null, false);
      cb(new Error("Incorrect Naming Format"));
    }

    cb(null, true);
  }
});

const handleFileUpload = (req: Request, res: Response) => {
  if (!req.file) {
    console.log(req.file);
    return res.status(400).json("please upload a file");
  }
  upload.single("file")(req, res, (err: multer.MulterError | any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the limit." });
      }
      return res.status(400).json({ error: "File upload failed." });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    console.log("upload sucessful");
    res.status(200).json({ message: "upload successful", body: req.file });
  });
};

export { handleFileUpload };
