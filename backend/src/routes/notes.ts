import express from "express";
import * as NotesController from "../controllers/notes";

const router = express.Router();
router.get("/", NotesController.getNotes);
router.post("/", NotesController.createNote);
router.get("/:noteId", NotesController.getNote);
router.patch("/:noteId", NotesController.updateNode);
router.delete("/:noteId", NotesController.deleteNote);
export default router;