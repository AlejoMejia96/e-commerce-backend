const router = require("express").Router();
const getProducts = require("../controllers/products/getProducts.js");
const countPages = require("../controllers/products/utils/countPages.js");
const filterCompose = require("../controllers/products/utils/filterCompose.js");
const orderCompose = require("../controllers/products/utils/orderCompose.js");
const paginationCompose = require("../controllers/products/utils/paginationCompose.js");
const { Sale } = require("../database.js");

router.get("", async function (req, res) {
  const { search, minPrice, maxPrice, freeShipping, categoryId, order, limit, offset } =
    req.query;
  const filterConditions = await filterCompose(
    search,
    minPrice,
    maxPrice,
    freeShipping,
    categoryId
  );
  const orderDisposition = await orderCompose(order);
  const paginationSettings = await paginationCompose(offset, limit);
  const products = await getProducts(
    orderDisposition,
    paginationSettings,
    ...filterConditions
  );
  const pages = await countPages(limit, ...filterConditions);
  const globalSales = await Sale.findAll({
    where: { global: true },
    attributes: ["percentage", "day", "productAmount", "id"],
  });
  return res.status(200).send({
    products: products,
    pages: pages,
    page: offset ? Number(offset) : 1,
    globalSales: globalSales,
  });
});

module.exports = router;
