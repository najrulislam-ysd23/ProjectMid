const port = 8000;
const express = require("express");
const app = express();


const AuthRouter = require("./routes/Auth");
const UserRouter = require("./routes/User");
const BookRouter = require("./routes/Book");
const TransactionRouter = require("./routes/Transaction");
const CartRouter = require("./routes/Cart");
const ReviewRouter = require("./routes/Review");
const DiscountRouter = require("./routes/Discount");


const dotenv = require("dotenv");
dotenv.config();
const databaseConnection = require("./config/database");

app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded



app.use("/auth", AuthRouter);
app.use("/users", UserRouter);
app.use("/books", BookRouter);
app.use("/transactions", TransactionRouter);
app.use("/carts", CartRouter);
app.use("/reviews", ReviewRouter);
app.use("/discounts", DiscountRouter);


// NO-ROUTE MATCHED
app.use((req, res) => {
    res.status(400).send({ message: "No route found" });
});

// checks invalid json file format
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({ message: "Invalid json format" });
    }
    next();
});


databaseConnection(() => {
    app.listen(8000, () => {
        // console.log(process.env.TEST_DB);
        console.log("Server is running on port", port);
    });
});
