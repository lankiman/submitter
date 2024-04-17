import { NextFunction, Request, Response } from "express";
import {
  storageHelper,
  uploadHelper,
  handleFileUpload
} from "../middlewares/helperFunctions";

const folderPath: string = "/home/lankiman/Desktop/submissions";
const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2})|(\d{8}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-9]\.(py|mp4)$/;

const validExtensions = [".py", ".mp4"];

const storage = storageHelper(folderPath, true);

const upload = uploadHelper(storage, validExtensions, "python", namePattern);

const handlePythonFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  handleFileUpload(req, res, next, upload);
};

export default handlePythonFileUpload;
