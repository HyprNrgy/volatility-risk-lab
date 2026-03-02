import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers, weights, benchmark = 'SPY', shock = -0.10 } = body;

    if (!tickers || !weights || tickers.length !== weights.length) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 5); // 5 years of data for beta

    const queryOptions = {
      period1: startDate.toISOString().split('T')[0],
      period2: endDate.toISOString().split('T')[0],
      interval: '1d' as const,
    };

    // Fetch benchmark data
    let benchData: any[] = [];
    try {
      benchData = await yahooFinance.historical(benchmark, queryOptions);
    } catch (e: any) {
      return NextResponse.json({ error: `Failed to fetch benchmark data for ${benchmark}: ${e.message}` }, { status: 400 });
    }

    if (!benchData || benchData.length < 2) {
      return NextResponse.json({ error: `Insufficient benchmark data for ${benchmark}` }, { status: 400 });
    }

    // Calculate daily returns for benchmark
    const benchReturns: { date: string; ret: number }[] = [];
    for (let i = 1; i < benchData.length; i++) {
      const ret = (benchData[i].adjClose - benchData[i - 1].adjClose) / benchData[i - 1].adjClose;
      benchReturns.push({ date: benchData[i].date.toISOString().split('T')[0], ret });
    }

    const benchVariance = benchReturns.reduce((sum, r) => sum + Math.pow(r.ret, 2), 0) / benchReturns.length;

    const assetResults = [];
    let portfolioExpectedImpact = 0;

    // Historical scenarios
    const scenarios = [
      { name: 'COVID-19 Crash', start: '2020-02-19', end: '2020-03-23' },
      { name: '2022 Bear Market', start: '2022-01-03', end: '2022-10-12' },
    ];

    const scenarioResults = scenarios.map(s => ({ name: s.name, portfolioReturn: 0, valid: true }));

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      const weight = weights[i];

      let assetData: any[] = [];
      try {
        assetData = await yahooFinance.historical(ticker, queryOptions);
      } catch (e: any) {
        throw new Error(`Failed to fetch data for ${ticker}: ${e.message}`);
      }

      if (!assetData || assetData.length < 2) {
        throw new Error(`Insufficient data for ${ticker}`);
      }

      // Align dates and calculate covariance
      let covSum = 0;
      let count = 0;

      const assetMap = new Map(assetData.map(d => [d.date.toISOString().split('T')[0], d.adjClose]));

      for (let j = 1; j < benchReturns.length; j++) {
        const date = benchReturns[j].date;
        const prevDate = benchReturns[j - 1].date;

        if (assetMap.has(date) && assetMap.has(prevDate)) {
          const currentPrice = assetMap.get(date)!;
          const prevPrice = assetMap.get(prevDate)!;
          const assetRet = (currentPrice - prevPrice) / prevPrice;
          
          covSum += assetRet * benchReturns[j].ret;
          count++;
        }
      }

      const covariance = count > 0 ? covSum / count : 0;
      const beta = benchVariance > 0 ? covariance / benchVariance : 1;
      const expectedImpact = beta * shock;

      portfolioExpectedImpact += weight * expectedImpact;

      assetResults.push({
        ticker,
        weight,
        beta,
        expectedImpact
      });

      // Calculate historical scenario returns
      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        const scenario = scenarios[sIdx];
        // Find closest dates
        let startPrice = null;
        let endPrice = null;

        // Find exact or next available date for start
        const sortedDates = Array.from(assetMap.keys()).sort();
        const startMatch = sortedDates.find(d => d >= scenario.start);
        const endMatch = sortedDates.slice().reverse().find(d => d <= scenario.end);

        if (startMatch && endMatch && startMatch < endMatch) {
          startPrice = assetMap.get(startMatch);
          endPrice = assetMap.get(endMatch);
        }

        if (startPrice && endPrice) {
          const ret = (endPrice - startPrice) / startPrice;
          scenarioResults[sIdx].portfolioReturn += weight * ret;
        } else {
          scenarioResults[sIdx].valid = false; // Missing data for this asset in this period
        }
      }
    }

    return NextResponse.json({
      benchmark,
      shock,
      portfolioExpectedImpact,
      assetResults,
      historicalScenarios: scenarioResults.filter(s => s.valid)
    });

  } catch (error: any) {
    console.error('Scenario API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process scenario analysis' }, { status: 500 });
  }
}
