import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { listMarketAlgos, createApplication, listMyApplications, listAllApplications, reviewApplication, updateMyApplication } from "./publisherApplications.controller.js";

const router = Router();

router.get("/algos/market", listMarketAlgos);
router.post("/algos/publisher-applications", authenticate, createApplication);
router.get("/algos/publisher-applications", authenticate, listMyApplications);
router.put("/algos/publisher-applications/:id", authenticate, updateMyApplication);
// Admin: declared before "/:id" so "all" isn't read as an id.
router.get("/algos/publisher-applications/all", authenticate, requireAdmin, listAllApplications);
router.patch("/algos/publisher-applications/:id", authenticate, requireAdmin, reviewApplication);

export default router;
