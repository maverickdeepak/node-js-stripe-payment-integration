const express = require("express");
const app = express();
const path = require("path");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());

// dummy products data
const dummyProducts = new Map([
  [1, { priceOfProducts: 2000, name: "Musleblaz Whey Protein" }],
  [2, { priceOfProducts: 2500, name: "GNC Biozyme Creatine" }],
]);

app.post("/checkout-session", async function (req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      currency: "inr",
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = dummyProducts.get(item.id);
        return {
          price_data: {
            currency: "inr",
            product_data: { name: storeItem.name },
            unit_amount: storeItem.priceOfProducts,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `http://localhost:${PORT}/success`,
      cancel_url: `http://localhost:${PORT}/cancel`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/success", function (req, res) {
  res.render("success");
});
app.get("/cancel", function (req, res) {
  res.render("cancel");
});

app.get("/", function (req, res) {
  res.render("home");
});

app.listen(PORT, function () {
  console.log(`server is running at port ${PORT}`);
});
