import { NextFunction, Request, Response } from "express";

import {
  storageHelper,
  uploadHelper,
  handleFileUpload
} from "../middlewares/helperFunctions";

const folderPath: string = "../../cSubmissions/";
const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-5]\.(c|mp4|h)$/;

const validExtensions = [".c", ".mp4", ".h"];

const storage = storageHelper(folderPath);

const upload = uploadHelper(storage, validExtensions, "c", namePattern);

const handleCFileUpload = (req: Request, res: Response, next: NextFunction) => {
  handleFileUpload(req, res, next, upload);
};

export default handleCFileUpload;
