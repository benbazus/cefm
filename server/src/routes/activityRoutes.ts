import express from "express";
import prisma from "../config/database";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { itemId, activityType, details } = req.body;
    const activity = await prisma.activity.create({
      data: {
        itemId,
        activityType,
        details,
        userId: req.user!.id,
      },
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: "Error creating activity" });
  }
});

router.get("/:itemId", async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        itemId: req.params.itemId,
        userId: req.user!.id,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Error fetching activities" });
  }
});

export { router as activityRouter };
