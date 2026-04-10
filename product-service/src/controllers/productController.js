const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Hàm tạo slug từ tên
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// GET /api/products — Danh sách có filter, phân trang, sắp xếp
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      sortBy = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
      inStock,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category && { category: { slug: category } }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
      ...(inStock === "true" && { stock: { gt: 0 } }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, imageUrl, categoryId } = req.body;
    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: { name, slug, price, description, stock, imageUrl, categoryId },
      include: { category: true },
    });

    res.status(201).json({
      success: true,
      data: product,
      message: "Tạo sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, imageUrl, categoryId, isActive } =
      req.body;

    // Nếu có đổi tên thì cập nhật slug
    const updateData = {
      ...(name && { name, slug: generateSlug(name) }),
      ...(price !== undefined && { price }),
      ...(description !== undefined && { description }),
      ...(stock !== undefined && { stock }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(categoryId !== undefined && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { category: true },
    });

    res.json({ success: true, data: product, message: "Cập nhật thành công" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — Hard delete
const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};