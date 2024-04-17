import express from "express";
import handleCFileUpload from "../controllers/cplatformController";
import { validateUploadStatus } from "../middlewares/helperFunctions";

const cRouter = express.Router();

cRouter.post("/", handleCFileUpload, validateUploadStatus);

export default cRouter;
