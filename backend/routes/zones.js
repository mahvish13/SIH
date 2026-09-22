import { Router } from "express";
import { nerZones, nerRoads } from "../data/nerZones.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(nerZones);
});

router.get("/roads", (_req, res) => {
  res.json(nerRoads);
});

export default router;
