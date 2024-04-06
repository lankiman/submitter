import { NextFunction, Request, Response } from "express";
// import fs from "fs";
import multer from "multer";
import path from "path";

const folderPath: string = "../../cSubmissions/";
const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-9]\.(c|mp4|h)$/;

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
    const validExtensions = [".c", ".h", ".mp4"];
    if (!validExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          "Only text or video files with .c, .h or .mp4 extensions are allowed"
        )
      );
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
      default:
        break;
    }

    if (!namePattern.test(file.originalname)) {
      return cb(new Error("Incorrect Naming Format"));
    }

    cb(null, true);
  }
});

const handleFileUploadC = (req: Request, res: Response, next: NextFunction) => {
  upload.array("file")(req, res, (err: multer.MulterError | any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload failed." });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const validateUploadStatusC = (req: Request, res: Response) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ error: "No file uploaded, please choose a file to upload" });
  }
  console.log("upload sucessful");
  res.status(200).json({ message: "upload successful", body: req.files });
};

export { handleFileUploadC, validateUploadStatusC };
