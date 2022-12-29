const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/exchange", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(
        `https://api.bybit.com/spot/v3/public/quote/depth?symbol=${e}USDT&limit=40`
      )
      .then((data) => ({ pair: e, asks: data.data.result.asks }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
