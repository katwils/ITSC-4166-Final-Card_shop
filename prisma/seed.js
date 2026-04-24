import bcrypt from 'bcrypt';
import 'dotenv/config';
import prisma from '../src/config/db.js';

async function seedData() {
  try {
    console.log('Seeding database...');

    // साफ reset (order matters because of FK constraints)
    await prisma.order.deleteMany();
    await prisma.card.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // -------------------------
    // USERS
    // -------------------------
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });

    const customer = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: hashedPassword,
        role: 'customer',
      },
    });

    // -------------------------
    // CATEGORIES
    // -------------------------
    const pokemon = await prisma.category.create({
      data: { name: 'Pokemon' },
    });

    const mtg = await prisma.category.create({
      data: { name: 'Magic the Gathering' },
    });

    const riftbound = await prisma.category.create({
      data: { name: 'Riftbound' },
    });

    // -------------------------
    // CARDS
    // -------------------------
    const card1 = await prisma.card.create({
      data: {
        name: 'Charizard',
        description: 'Fire-type Pokémon card',
        image: '/images/charizard.jpg',
        price: 199.99,
        stock: 5,
        categoryId: pokemon.id,
      },
    });

    const card2 = await prisma.card.create({
      data: {
        name: 'Pikachu',
        description: 'Electric-type Pokémon card',
        image: '/images/pikachu.jpg',
        price: 49.99,
        stock: 10,
        categoryId: pokemon.id,
      },
    });

    const card3 = await prisma.card.create({
      data: {
        name: 'Black Lotus',
        description: 'Legendary MTG card',
        image: '/images/black-lotus.jpg',
        price: 9999.99,
        stock: 1,
        categoryId: mtg.id,
      },
    });

    const card4 = await prisma.card.create({
      data: {
        name: 'Ahri, Inquisitive Overnumbered',
        description: 'A cunning fox spirit who uses her charm and illusions to outwit her enemies',
        image: '/images/ahri.jpg',
        price: 29.99,
        stock: 15,
        categoryId: riftbound.id,
      },
    });

    // -------------------------
    // ORDERS
    // -------------------------
    await prisma.order.create({
      data: {
        userId: customer.id,
        totalPrice: card1.price + card2.price,
        status: 'pending',
      },
    });

    console.log('✅ Seed completed successfully!');
    console.log('Login credentials:');
    console.log('Admin → admin@example.com / Password123!');
    console.log('User  → user@example.com / Password123!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();