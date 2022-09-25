const express = require("express");
require("dotenv").config();
const connectToDB = require("./config/db");
const apiRouter = require("./routes/apiRoutes");
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(process.env.API_URL, apiRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", function (req, res) {
    res.status(200).json({
        msg: 'Group-Chat API'
    });
});
connectToDB();
app.listen(PORT, console.log(`8080 server port ${PORT}`));