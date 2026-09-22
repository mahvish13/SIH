import { Router } from "express";
import { landslideHistory, statesWithoutMajorRecordedEvent } from "../data/landslideHistory.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ events: landslideHistory, statesWithoutMajorRecordedEvent });
});

router.get("/:state", (req, res) => {
  const { state } = req.params;
  const events = landslideHistory.filter((e) => e.state.toLowerCase() === state.toLowerCase());
  res.json({
    state,
    events,
    hasMajorRecordedEvent: events.length > 0,
    note: events.length === 0 ? "No single large, well-documented fatal event found in our research for this state." : null
  });
});

export default router;
