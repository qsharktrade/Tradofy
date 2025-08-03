let userBalance = 1000;
const balanceDisplay = document.getElementById('balance');
const entryMarkerUp = document.getElementById('entryMarkerUp');
const entryMarkerDown = document.getElementById('entryMarkerDown');
const chartDiv = document.getElementById('chart');

function updateBalanceDisplay() {
  balanceDisplay.innerText = `৳${userBalance.toFixed(2)}`;
}
updateBalanceDisplay();

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

// Initialize with 30 candles (1 candle per minute)
let candleDuration = 60;
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

// Generate initial candles
let prevClose = 100;
for(let i=0; i<30; i++) {
  const candle = generateRandomCandle(lastTimestamp + i * candleDuration, prevClose);
  prevClose = candle.close;
  candles.push(candle);
}
candleSeries.setData(candles);

// Update chart width on resize
window.addEventListener('resize', () => {
  chart.applyOptions({ width: chartDiv.clientWidth });
});

// Single candle live update variables
let currentCandleStart = candles[candles.length - 1].time;
let currentCandle = candles[candles.length - 1];
let secondsElapsed = 0;

// Update current candle every second
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

// Place trade function with correct win/lose logic
function placeTrade(direction) {
  const duration = parseInt(document.getElementById('timeSelect').value);
  candleDuration = duration;

  const tradeAmount = 100;

  if (userBalance < tradeAmount) {
    alert('Insufficient Balance!');
    return;
  }

  userBalance -= tradeAmount;
  updateBalanceDisplay();

  // Show marker for trade direction
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

    const exitPrice = currentCandle.close;

    let won = false;
    if (direction === 'call' && exitPrice > entryPrice) {
      won = true;
    } else if (direction === 'put' && exitPrice < entryPrice) {
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
  }, duration * 1000);
    }
