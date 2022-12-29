const getAverage = (array) => {
  return array.reduce((acc, el) => acc + +el[1], 0);
};

const getAveragePriceForAmmount = (amount, prices) => {
  let total = 0;
  let totalCoin = 0;
  const totalArray = [];
  for (let i = 0; i < prices.length; i++) {
    const [coinPrice, coinAmount] = prices[i];
    const orderPrice = coinPrice * coinAmount;
    const prevTotal = total;
    total += orderPrice;
    totalCoin += coinAmount;

    if (i === 0 && total >= amount) {
      return coinPrice;
    }
    if (total >= amount) {
      const neededAmount = amount - prevTotal;
      const neededCoinAmount = neededAmount / coinPrice;
      totalArray.push([coinPrice, neededCoinAmount]);

      return amount / getAverage(totalArray);
    }
    totalArray.push(prices[i]);
  }

  return 0;
};

const formatByBit = (data) => {
  return data.map(({ pair, asks }) => ({
    name: pair,
    "100x": getAveragePriceForAmmount(100, asks),
    "150x": getAveragePriceForAmmount(150, asks),
    "300x": getAveragePriceForAmmount(300, asks),
    "500x": getAveragePriceForAmmount(500, asks),
  }));
};

const getSavedPairs = () => {
  return (
    localStorage.getItem("savedPairs") || ["DFL", "ZBC", "GENE"]
  ).concat();
};

const formatToUSDT = (array) => {
  return array.map((e) => e + "USDT");
};

const getJupiterData = async () => {
  const requests = [100, 150, 300, 500].map((e) => {
    return Promise.all(
      getSavedPairs().map((el) =>
        fetch(`https://price.jup.ag/v3/price?ids=USDC&vsToken=${el}`)
          .then((res) => res.json())
          .then((data) => {
            const price = data.data["USDC"].price;
            const tokenAmount = 100 / price;
            return fetch(
              `https://price.jup.ag/v3/price?ids=USDC&vsAmount=${tokenAmount}&vsToken=${el}`
            )
              .then((res) => res.json())
              .then((data) => data.data["USDC"]);
          })
      )
    );
  });

  const [x100, x150, x300, x500] = await Promise.all(requests);

  console.log(x100);

  return getSavedPairs().map((e) => ({
    name: e,
    "100x": 1 / x100[e].price,
    "150x": 1 / x150[e].price,
    "300x": 1 / x300[e].price,
    "500x": 1 / x500[e].price,
  }));
};

const getByBitData = async () => {
  return fetch("http://localhost:3000/exchange", {
    method: "POST",
    body: JSON.stringify({
      pairs: getSavedPairs(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => formatByBit(data));
};

const getColor = (diff, percent) => {
  if (diff < 0) return "red";
  if (percent > 1) return "purple";
  return " green";
};

const getRow = (jup, bybit, field) => {
  if (!jup[field] || !bybit[field]) return "<div></div>";
  const diff = jup[field] - bybit[field];
  const percent = (jup[field] / 100) * diff;
  return `<div class=${getColor(diff, percent)}><p>Jupiter: ${
    jup[field]
  }</p><p>ByBit: ${Number(bybit[field]).toFixed(
    7
  )}</p><p>Difference: ${diff.toFixed(7)}</p>
    <p>Percent: ${percent.toFixed(3)}</p>
    </div>`;
};

const renderTable = ([jupiterData, bybitData]) => {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = jupiterData
    .map((e) => {
      const bbItem = bybitData.find((el) => el.name === e.name);
      return ` 
      <tr>
          <td>${e.name}</td>
          <td>${getRow(e, bbItem, "100x")}</td>
          <td>${getRow(e, bbItem, "150x")}</td>
          <td>${getRow(e, bbItem, "300x")}</td>
          <td>${getRow(e, bbItem, "500x")}</td>
      </tr>`;
    })
    .concat();
};

setTimeout(async () => {
  const data = await Promise.all([getJupiterData(), getByBitData()]);

  renderTable(data);
}, 1000);

//   {
//     headers: {
//       "X-BAPI-SIGN-TYPE": "2",
//       "X-BAPI-SIGN": "UFsxFXL4eUzB51OX4DVMDpL3f4Rm0ZBkJ3LH",
//       "X-BAPI-API-KEY": "vr1zEkyZ0V2WHkqZMu",
//       "X-BAPI-TIMESTAMP": Date.now(),
//       "X-BAPI-RECV-WINDOW": "5000",
//       "Access-Control-Allow-Origin": "*",
//     },
//   }
