const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/connect");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - appointmentDate
 *         - appointmentTime
 *         - reason
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB generated ID
 *         appointmentDate:
 *           type: string
 *           example: 2026-02-20
 *         appointmentTime:
 *           type: string
 *           example: 10:30 AM
 *         reason:
 *           type: string
 *           example: Headache and dizziness
 *         status:
 *           type: string
 *           example: Scheduled
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment found
 *       400:
 *         description: Invalid appointment ID format
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Invalid appointment ID format
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Invalid appointment ID format
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */


router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const appointments = await db.collection("appointments").find().toArray();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    const appointment = await db.collection("appointments").findOne({ _id: new ObjectId(id) });

    if (!appointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Invalid appointment ID" });
  }
});


router.post("/",isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { appointmentDate, appointmentTime, reason, status } = req.body;

    if (!appointmentDate || !appointmentTime || !reason || !status) {
      return res.status(400).json({ error: "appointmentDate, appointmentTime, reason, status are required" });
    }

    const newappointment = {
      appointmentDate,
      appointmentTime,
      reason,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("appointments").insertOne(newappointment);
    res.status(201).json({ message: "appointment created Successfullly", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});


router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    const {_id, createdAt, updatedAt, ...updatedData} = req.body;

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Update data cannot be empty" });
    }

    updatedData.updatedAt = new Date();

    const result = await db.collection("appointments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});


router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid appointment ID format" });
    }

    const result = await db.collection("appointments").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "appointment not found" });
    }

    res.status(200).json({ message: "appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

module.exports = router;
