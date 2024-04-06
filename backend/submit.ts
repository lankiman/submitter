import express from "express";
import { handleFileUpload, validateUploadStatus } from "./controller";

const router = express.Router();

router.post("/:dept", handleFileUpload, validateUploadStatus);

export default router;
