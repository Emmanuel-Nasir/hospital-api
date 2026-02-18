const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/connect");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       required:
 *         - name
 *         - specialization
 *         - phoneNumber
 *       properties:
 *         name:
 *           type: string
 *           example: "Emmanuel Nasir"
 *         specialization:
 *           type: string
 *           example: "General Surgeon"
 *         phoneNumber:
 *           type: string
 *           example: "0902441441162"
 *         department:
 *           type: string
 *           example: "Consulting Doctor"
 */
/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const doctors = await db.collection("doctors").find().toArray();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid doctor ID format" });
    }

    const doctor = await db.collection("doctors").findOne({ _id: new ObjectId(id) });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       201:
 *         description: Doctor created
 *       400:
 *         description: Missing required fields
 */
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { name, specialization, phoneNumber, department } = req.body;

    if (!name || !specialization || !phoneNumber) {
      return res.status(400).json({ error: "name, specialization, phone number are required" });
    }

    const newDoctor = {
      name,
      specialization,
      phoneNumber,
      department: department || ""
    };

    const result = await db.collection("doctors").insertOne(newDoctor);
    res.status(201).json({ message: "Doctor created", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create doctor" });
  }
});

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update a doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor updated
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Doctor not found
 */
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid doctor ID format" });
    }

    const updatedData = req.body;

    const result = await db.collection("doctors").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete a doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Doctor ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor deleted
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Doctor not found
 */
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid doctor ID format" });
    }

    const result = await db.collection("doctors").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete doctor" });
  }
});

module.exports = router;
