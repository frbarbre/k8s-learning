import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  searchContacts,
  toggleFavorite,
  updateContact,
} from "../controllers/contactController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllContacts);
router.get("/search", searchContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);
router.patch("/:id/favorite", toggleFavorite);

export default router;
