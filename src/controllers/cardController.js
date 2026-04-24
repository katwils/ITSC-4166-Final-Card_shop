import { cardRepository } from '../repositories/index.js';

export async function createCard(req, res, next) {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    if (!name || price === undefined || stock === undefined || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: 'Price and stock must be non-negative' });
    }

    const card = await cardRepository.create({
      name,
      description,
      price,
      stock,
      categoryId: parseInt(categoryId),
    });

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
}

export async function getAllCards(req, res, next) {
  try {
    const cards = await cardRepository.findAll();
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
}

export async function getCardById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid card ID' });
    }

    const card = await cardRepository.findById(id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
}

export async function updateCard(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid card ID' });
    }

    // Check if card exists
    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Validate input
    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price must be non-negative' });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: 'Stock must be non-negative' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);

    const card = await cardRepository.update(id, updateData);
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
}

export async function deleteCard(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid card ID' });
    }

    // Check if card exists
    const existingCard = await cardRepository.findById(id);
    if (!existingCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await cardRepository.delete(id);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    next(error);
  }
}
