import express from 'express';
import {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
} from '../controllers/cardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/cards:
 *   post:
 *     tags:
 *       - Cards
 *     summary: Create a new card
 *     description: Create a new card for Cardboard Kingdom (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Charizard
 *               description:
 *                 type: string
 *                 example: Fire-type Pokémon card
 *               price:
 *                 type: number
 *                 example: 199.99
 *               stock:
 *                 type: integer
 *                 example: 5
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an admin
 */
router.post('/', authenticateToken, requireAdmin, createCard);

/**
 * @swagger
 * /api/cards:
 *   get:
 *     tags:
 *       - Cards
 *     summary: Get all cards
 *     description: Retrieve all cards from Cardboard Kingdom (Public)
 *     responses:
 *       200:
 *         description: List of cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   categoryId:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllCards);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     tags:
 *       - Cards
 *     summary: Get a single card by ID
 *     description: Retrieve a specific card from Cardboard Kingdom (Public)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Card details
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Card not found
 */
router.get('/:id', getCardById);

/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     tags:
 *       - Cards
 *     summary: Update a card
 *     description: Update an existing card in Cardboard Kingdom (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card updated successfully
 *       400:
 *         description: Invalid input or ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Card not found
 */
router.put('/:id', authenticateToken, requireAdmin, updateCard);

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     tags:
 *       - Cards
 *     summary: Delete a card
 *     description: Delete a card from Cardboard Kingdom (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an admin
 *       404:
 *         description: Card not found
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteCard);

export default router;
