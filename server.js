const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/exchange", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(
        `https://api.bybit.com/spot/v3/public/quote/depth?symbol=${e}USDT&limit=40`
      )
      .then((data) => ({
        pair: e,
        asks: data.data.result.asks,
        bids: data.data.result.bids,
      }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.post("/exchange2", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(
        `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${e}_USDT&limit=40`
      )
      .then((data) => ({
        pair: e,
        asks: data.data.asks,
        bids: data.data.bids,
      }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.post("/exchange3", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(`https://api.binance.com/api/v3/depth?symbol=${e}USDT&limit=30`)
      .then((data) => ({
        pair: e,
        asks: data.data.asks,
        bids: data.data.bids,
      }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.post("/exchange4", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(
        `https://api.huobi.pro/market/depth?symbol=${e.toLowerCase()}usdt&type=step0`
      )
      .then((data) => ({
        pair: e,
        asks: data.data.tick.asks,
        bids: data.data.tick.bids,
      }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.post("/exchange5", async (req, res) => {
  const { pairs } = req.body;
  const requests = pairs.map((e) =>
    axios
      .get(
        `https://api.coinex.com/v1/market/depth?market=${e}USDT&merge=0.00001`
      )
      .then((data) => ({
        pair: e,
        asks: data.data.data.asks,
        bids: data.data.data.bids,
      }))
  );

  Promise.all(requests).then((data) => res.json(data));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
