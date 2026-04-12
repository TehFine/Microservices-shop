const { PrismaClient } = require("@prisma/client");
const { cloudinary } = require("../config/cloudinary");
const { cacheGet, cacheSet, cacheDelPattern } = require("../config/redis");

const prisma = new PrismaClient();

const generateSlug = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// GET /api/products — Có cache
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10,
      search = "", category,
      sortBy = "createdAt", order = "desc",
      minPrice, maxPrice, inStock,
    } = req.query;

    // Tạo cache key từ query params
    const cacheKey = `products:${JSON.stringify(req.query)}`;

    // Kiểm tra cache trước
    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({ ...cached, cached: true });
    }
    console.log(`Cache MISS: ${cacheKey}`);

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

    const response = {
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };

    // Lưu vào cache 5 phút
    await cacheSet(cacheKey, response);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id — Có cache
const getProductById = async (req, res, next) => {
  try {
    const cacheKey = `product:${req.params.id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.json({ ...cached, cached: true });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay san pham",
      });
    }

    const response = { success: true, data: product };
    await cacheSet(cacheKey, response);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// POST /api/products — Xoa cache
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, imageUrl, categoryId } = req.body;
    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: { name, slug, price, description, stock, imageUrl, categoryId },
      include: { category: true },
    });

    // Xoa tat ca cache products
    await cacheDelPattern("products:*");
    console.log("Cache: Xoa sau khi tao san pham moi");

    res.status(201).json({
      success: true,
      data: product,
      message: "Tao san pham thanh cong",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — Xoa cache
const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, stock, imageUrl, categoryId, isActive } = req.body;

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

    // Xoa cache sản phẩm này và danh sách
    await cacheDelPattern("products:*");
    await cacheDelPattern(`product:${req.params.id}`);

    res.json({ success: true, data: product, message: "Cap nhat thanh cong" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — Xoa cache
const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });

    // Xoa cache
    await cacheDelPattern("products:*");
    await cacheDelPattern(`product:${req.params.id}`);

    res.json({ success: true, message: "Da an san pham thanh cong" });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/image — Xoa cache
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui long chon file anh",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!product) {
      await cloudinary.uploader.destroy(req.file.filename);
      return res.status(404).json({
        success: false,
        message: "Khong tim thay san pham",
      });
    }

    if (product.imageUrl) {
      try {
        const urlParts = product.imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `microservices-shop/products/${fileName.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Khong the xoa anh cu:", err.message);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { imageUrl: req.file.path },
      include: { category: true },
    });

    // Xoa cache
    await cacheDelPattern("products:*");
    await cacheDelPattern(`product:${req.params.id}`);

    res.json({
      success: true,
      message: "Upload anh thanh cong",
      data: {
        product: updatedProduct,
        imageUrl: req.file.path,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay san pham",
      });
    }

    if (!product.imageUrl) {
      return res.status(400).json({
        success: false,
        message: "San pham chua co anh",
      });
    }

    const urlParts = product.imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `microservices-shop/products/${fileName.split(".")[0]}`;
    await cloudinary.uploader.destroy(publicId);

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { imageUrl: null },
    });

    await cacheDelPattern("products:*");
    await cacheDelPattern(`product:${req.params.id}`);

    res.json({
      success: true,
      message: "Xoa anh thanh cong",
      data: updatedProduct,
    });
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
  uploadProductImage,
  deleteProductImage,
};