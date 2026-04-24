import { orderRepository } from '../repositories/index.js';

export async function createOrder(req, res, next) {
  try {
    const { totalPrice, status } = req.body;
    const userId = req.user.userId;

    if (totalPrice === undefined || totalPrice < 0) {
      return res.status(400).json({ message: 'Valid total price is required' });
    }

    const order = await orderRepository.create({
      userId,
      totalPrice,
      status: status || 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let orders;

    if (userRole === 'admin') {
      // Admin can see all orders
      orders = await orderRepository.findAll();
    } else {
      // Regular users can only see their own orders
      orders = await orderRepository.findByUserId(userId);
    }

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await orderRepository.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: owner or admin
    const isOwner = order.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await orderRepository.update(id, { status });
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: owner or admin
    const isOwner = existingOrder.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await orderRepository.delete(id);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
}
