import prisma from '../config/db.js';

export const cardRepository = {
  create: async (data) => {
    return prisma.card.create({ data });
  },

  findAll: async () => {
    return prisma.card.findMany({
      include: { category: true },
    });
  },

  findById: async (id) => {
    return prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
  },

  update: async (id, data) => {
    return prisma.card.update({
      where: { id: parseInt(id) },
      data,
      include: { category: true },
    });
  },

  delete: async (id) => {
    return prisma.card.delete({
      where: { id: parseInt(id) },
    });
  },
};

export const categoryRepository = {
  create: async (data) => {
    return prisma.category.create({ data });
  },

  findAll: async () => {
    return prisma.category.findMany();
  },

  findById: async (id) => {
    return prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { cards: true },
    });
  },

  update: async (id, data) => {
    return prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });
  },

  delete: async (id) => {
    return prisma.category.delete({
      where: { id: parseInt(id) },
    });
  },

  findByName: async (name) => {
    return prisma.category.findUnique({
      where: { name },
    });
  },
};

export const orderRepository = {
  create: async (data) => {
    return prisma.order.create({ data });
  },

  findAll: async () => {
    return prisma.order.findMany({
      include: { user: { select: { id: true, email: true } } },
    });
  },

  findById: async (id) => {
    return prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { id: true, email: true } } },
    });
  },

  findByUserId: async (userId) => {
    return prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: { user: { select: { id: true, email: true } } },
    });
  },

  update: async (id, data) => {
    return prisma.order.update({
      where: { id: parseInt(id) },
      data,
      include: { user: { select: { id: true, email: true } } },
    });
  },

  delete: async (id) => {
    return prisma.order.delete({
      where: { id: parseInt(id) },
    });
  },
};

export const userRepository = {
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, email: true, role: true },
    });
  },

  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};
