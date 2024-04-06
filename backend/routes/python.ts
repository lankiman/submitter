import express from "express";
import handlePythonFileUpload from "../controllers/pythonController";
import { validateUploadStatus } from "../middlewares/helperFunctions";

const pythonRouter = express.Router();

pythonRouter.post("/:dept", handlePythonFileUpload, validateUploadStatus);

export default pythonRouter;
