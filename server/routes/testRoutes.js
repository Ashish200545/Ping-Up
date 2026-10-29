import express from "express";
import cloudinary from "../configs/cloudinary.js";

const router = express.Router();

router.get("/cloudinary-test", async (req, res) => {
  const result = await cloudinary.api.ping();
  res.json(result);
});

export default router;
