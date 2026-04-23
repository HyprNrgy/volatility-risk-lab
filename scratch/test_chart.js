const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance();

async function test() {
  const queryOptions = {
    period1: '2024-01-01',
    period2: '2024-01-10',
    interval: '1d',
  };
  try {
    const result = await yahooFinance.chart('AAPL', queryOptions);
    console.log(JSON.stringify(result.quotes.slice(0, 2), null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
