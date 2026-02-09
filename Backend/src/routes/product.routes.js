const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const productController = require("../controllers/product.controller");

// public
router.get("/", productController.getAllProducts);

// manual trigger for marking old products as Surplus
router.post("/mark-surplus", productController.markOldProductsSurplus);

// vendor (auth)
router.get("/mine", auth, productController.getMyProducts);
router.post("/", auth, productController.createProduct);
router.put("/:id", auth, productController.updateMyProduct);
router.delete("/:id", auth, productController.deleteMyProduct);

module.exports = router;
