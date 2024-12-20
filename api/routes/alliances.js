const express = require("express");
const router = express.Router();

const { AllianceController } = require("../controllers/alliances");

router.post("/viewSpecificAlliances", AllianceController.specificPossibleAlliances)
router.post("/:id", AllianceController.requestAlliance)
router.post("/:id/cancel", AllianceController.withdrawAllianceRequest)
router.post("/:id/forge", AllianceController.acceptAlliance)
router.post("/:id/reject", AllianceController.rejectAlliance)
router.get("/:id/receivedRequestsAdmin", AllianceController.viewReceivedRequestsAdmin)
router.get("/:id/find", AllianceController.findOneAlliance)
router.get("/:id/findAllianceWithUserRole", AllianceController.findWithRole)
router.get("/viewReceivedRequests", AllianceController.viewReceivedRequests)
router.get("/viewPotentialAlliances", AllianceController.viewPotentialAlliances)
router.get("/viewForgedAlliances", AllianceController.viewForgedAlliances)

module.exports = router;