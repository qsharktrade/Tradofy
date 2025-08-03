// ================== Setup =====================
const balanceDisplay = document.getElementById('balance');
const entryMarkerUp = document.getElementById('entryMarkerUp');
const entryMarkerDown = document.getElementById('entryMarkerDown');
const chartDiv = document.getElementById('chart');

// ইউজারের নাম লোকালস্টোরেজ থেকে নাও, নাহলে guest ধরে নাও
const currentUser = localStorage.getItem("currentUser") || "guest";

// ইউজার ব্যালেন্স লোকালস্টোরেজ থেকে লোড করো
let userBalances = JSON.parse(localStorage.getItem("userBalances") || "{}");
let userBalance = parseFloat(userBalances[currentUser]) || 0;

function updateBalanceDisplay() {
  balanceDisplay.innerText = `৳${userBalance.toFixed(2)}`;
}
updateBalanceDisplay();

function saveUserBalance() {
  userBalances[currentUser] = userBalance;
  localStorage.setItem("userBalances", JSON.stringify(userBalances));
}

// ================== Chart Setup =====================
const chart = LightweightCharts.createChart(chartDiv, {
  width: chartDiv.clientWidth,
  height: 300,
  layout: {
    backgroundColor: '#222',
    textColor: 'white',
  },
  grid: {
    vertLines: { color: '#444' },
    horzLines: { color: '#444' },
  },
  crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
  },
  priceScale: {
    borderColor: '#555',
  },
  timeScale: {
    borderColor: '#555',
    timeVisible: true,
    secondsVisible: false,
  },
});

const candleSeries = chart.addCandlestickSeries({
  upColor: '#00ff00',
  downColor: '#ff4d4d',
  borderVisible: false,
  wickVisible: true,
  borderColor: '#00ff00',
  wickColor: '#00ff00',
});

// Initialize candles
let candleDuration = 60; // seconds
let candles = [];
let lastTimestamp = Math.floor(Date.now() / 1000) - (29 * candleDuration);

function generateRandomCandle(time, prevClose) {
  let open = prevClose;
  let close = open + (Math.random() - 0.5) * 4;
  let high = Math.max(open, close) + Math.random() * 2;
  let low = Math.min(open, close) - Math.random() * 2;
  return {
    time: time,
    open: +open.toFixed(2),
    high: +high.toFixed(2),
    low: +low.toFixed(2),
    close: +close.toFixed(2),
  };
}

// Generate initial 30 candles
let prevClose = 100;
for(let i=0; i<30; i++) {
  const candle = generateRandomCandle(lastTimestamp + i * candleDuration, prevClose);
  prevClose = candle.close;
  candles.push(candle);
}
candleSeries.setData(candles);

window.addEventListener('resize', () => {
  chart.applyOptions({ width: chartDiv.clientWidth });
});

// Live candle update
let currentCandleStart = candles[candles.length - 1].time;
let currentCandle = candles[candles.length - 1];
let secondsElapsed = 0;

function updateCurrentCandle() {
  secondsElapsed++;
  const volatility = 1.5;
  let change = (Math.random() - 0.5) * volatility;
  let newClose = currentCandle.close + change;
  if (newClose > currentCandle.high) currentCandle.high = newClose;
  if (newClose < currentCandle.low) currentCandle.low = newClose;
  currentCandle.close = +newClose.toFixed(2);
  candleSeries.update(currentCandle);

  if (secondsElapsed >= candleDuration) {
    currentCandleStart += candleDuration;
    currentCandle = {
      time: currentCandleStart,
      open: currentCandle.close,
      high: currentCandle.close,
      low: currentCandle.close,
      close: currentCandle.close,
    };
    candles.push(currentCandle);
    if (candles.length > 30) candles.shift();
    candleSeries.setData(candles);
    secondsElapsed = 0;
  }
}
setInterval(updateCurrentCandle, 1000);

// ================== Trade Logic =====================
function placeTrade(direction) {
  const duration = parseInt(document.getElementById('timeSelect').value);
  candleDuration = duration;

  const tradeAmount = 100; // fixed for demo, you can make dynamic

  if (userBalance < tradeAmount) {
    alert('Insufficient Balance!');
    return;
  }

  userBalance -= tradeAmount;
  updateBalanceDisplay();
  saveUserBalance();

  // Show entry marker
  if (direction === 'call') {
    entryMarkerUp.style.display = 'block';
    entryMarkerDown.style.display = 'none';
  } else {
    entryMarkerUp.style.display = 'none';
    entryMarkerDown.style.display = 'block';
  }

  const entryPrice = currentCandle.close;

  setTimeout(() => {
    entryMarkerUp.style.display = 'none';
    entryMarkerDown.style.display = 'none';

    // Get admin-set winRate (default 85%)
    let winRate = parseInt(localStorage.getItem("winRate") || "85");

    // Random chance to decide win or lose based on winRate
    const randomChance = Math.random() * 100;
    let won = false;
    if (randomChance <= winRate) {
      won = true;
    }

    if (won) {
      const profit = tradeAmount * 1.8;
      userBalance += profit;
      alert(`🎉 You WON! Profit: ৳${profit.toFixed(2)}`);
    } else {
      alert(`😞 You LOST! Amount: ৳${tradeAmount.toFixed(2)}`);
    }

    updateBalanceDisplay();
    saveUserBalance();

  }, duration * 1000);
}
