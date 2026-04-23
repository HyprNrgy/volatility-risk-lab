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
    const firstQuote = result.quotes[0];
    console.log('Date type:', typeof firstQuote.date);
    console.log('Is Date instance:', firstQuote.date instanceof Date);
    console.log('Date value:', firstQuote.date);
  } catch (e) {
    console.error(e);
  }
}

test();
