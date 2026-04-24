import { categoryRepository } from '../repositories/index.js';

export async function createCategory(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await categoryRepository.findByName(name);
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const category = await categoryRepository.create({ name });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function getAllCategories(req, res, next) {
  try {
    const categories = await categoryRepository.findAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category exists
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name already exists (and it's not the same category)
    const categoryWithName = await categoryRepository.findByName(name);
    if (categoryWithName && categoryWithName.id !== parseInt(id)) {
      return res.status(409).json({ message: 'Category name already exists' });
    }

    const category = await categoryRepository.update(id, { name });
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if category exists
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await categoryRepository.delete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}
