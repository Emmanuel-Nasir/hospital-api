const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/connect");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - age
 *         - phoneNumber
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         age:
 *           type: integer
 *           example: 30
 *         phoneNumber:
 *           type: string
 *           example: "0902441441162"
 *         doctorId:
 *           type: string
 *           example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *         ailment:
 *           type: string
 *           example: "Malaria"
 *         address:
 *           type: string
 *           example: "123 Main St"
 */
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const patients = await db.collection("patients").find().toArray();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Patient not found
 */
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid patient ID format" });
    }

    const patient = await db
      .collection("patients")
      .findOne({ _id: new ObjectId(id) });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created
 *       400:
 *         description: Missing required fields
 */
router.post("/",isAuthenticated, async (req, res) => {
  try {
    const db = getDB();

    const { firstName, lastName, age, phoneNumber, doctorId, ailment, address } =
      req.body;

    // Required validation
    if (!firstName || !lastName || !age || !phoneNumber) {
      return res.status(400).json({
        error: "firstName, lastName, age, phone are required",
      });
    }

    // doctorId validation (optional but if provided must be valid)
    if (doctorId && !ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctorId format" });
    }

    const newPatient = {
      firstName,
      lastName,
      age,
      phoneNumber,
      doctorId: doctorId ? new ObjectId(doctorId) : null,
      ailment: ailment || "",
      address: address || "",
    };

    const result = await db.collection("patients").insertOne(newPatient);

    res.status(201).json({
      message: "Patient created successfully",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create patient" });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Patient not found
 */
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid patient ID format" });
    }

    const { firstName, lastName, age, phoneNumber, doctorId, ailment, address } =
      req.body;

    // doctorId validation
    if (doctorId && !ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "Invalid doctorId format" });
    }

    const updatedPatient = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(age && { age }),
      ...(phoneNumber && { phoneNumber }),
      ...(doctorId && { doctorId: new ObjectId(doctorId) }),
      ...(ailment && { ailment }),
      ...(address && { address }),
    };

    const result = await db.collection("patients").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedPatient }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ message: "Patient updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update patient" });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Patient not found
 */
router.delete("/:id",isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid patient ID format" });
    }

    const result = await db
      .collection("patients")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

module.exports = router;
