const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory };