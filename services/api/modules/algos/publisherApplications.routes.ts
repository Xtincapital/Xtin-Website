import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { createApplication, listMyApplications, listAllApplications, reviewApplication } from "./publisherApplications.controller.js";

const router = Router();

router.post("/algos/publisher-applications", authenticate, createApplication);
router.get("/algos/publisher-applications", authenticate, listMyApplications);
// Admin: declared before "/:id" so "all" isn't read as an id.
router.get("/algos/publisher-applications/all", authenticate, requireAdmin, listAllApplications);
router.patch("/algos/publisher-applications/:id", authenticate, requireAdmin, reviewApplication);

export default router;
