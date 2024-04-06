import express from "express";
import { handleFileUpload, validateUploadStatus } from "./controller";
import {
  handleFileUploadC,
  validateUploadStatusC
} from "./cplatformController";

const router = express.Router();

router.post("/:dept", handleFileUpload, validateUploadStatus);

router.post("/cplatform", handleFileUploadC, validateUploadStatusC);

export default router;
