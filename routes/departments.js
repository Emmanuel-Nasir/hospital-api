const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/connect");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Hospital departments management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - floor
 *         - headDoctor
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB generated ID
 *         name:
 *           type: string
 *           example: Cardiology
 *         description:
 *           type: string
 *           example: Handles heart-related illnesses and treatments
 *         floor:
 *           type: integer
 *           example: 2
 *         headDoctor:
 *           type: string
 *           example: Dr. Sarah Olu
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of departments
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department found
 *       400:
 *         description: Invalid department ID format
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Invalid department ID format
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Invalid department ID format
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const departments = await db.collection("departments").find().toArray();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid department ID format" });
    }

    const department = await db.collection("departments").findOne({ _id: new ObjectId(id) });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { name, description, floor, headDoctor } = req.body;

    if (!name || !description || !floor || !headDoctor) {
      return res.status(400).json({ error: "name, description, floor, headDoctor are required" });
    }

    const newDepartment = {
      name,
      description,
      floor: Number(floor),
      headDoctor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("departments").insertOne(newDepartment);
    res.status(201).json({ message: "Department created successfully", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
});

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid department ID format" });
    }

    // ✅ Strip immutable fields before update
    const { _id, createdAt, updatedAt, ...updatedData } = req.body;

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Update data cannot be empty" });
    }

    // ✅ Always refresh updatedAt
    updatedData.updatedAt = new Date();

    const result = await db.collection("departments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update department" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid department ID format" });
    }

    const result = await db.collection("departments").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department" });
  }
});

module.exports = router;