const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const productController = require("../controllers/product.controller");

// public
router.get("/", productController.getAllProducts);

// vendor (auth)
router.get("/mine", auth, productController.getMyProducts);
router.post("/", auth, productController.createProduct);
router.delete("/:id", auth, productController.deleteMyProduct);

module.exports = router;
