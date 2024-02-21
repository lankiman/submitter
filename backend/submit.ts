import express from "express";
import { handleFileUpload } from "./controller";

const router = express.Router();

router.post("/:dept", handleFileUpload);

export default router;
