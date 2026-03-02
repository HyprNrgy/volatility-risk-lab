import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { returns, std, mean, covariance, correlation, matrixMult, transpose } from '@/lib/math';

const yahooFinance = new YahooFinance();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers, weights, startDate, endDate, riskFreeRateSource = '^TNX' } = body;

    if (!tickers || !weights || tickers.length !== weights.length) {
      return NextResponse.json({ error: 'Invalid tickers or weights' }, { status: 400 });
    }

    const sumWeights = weights.reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(sumWeights - 1) > 0.001) {
      return NextResponse.json({ error: 'Weights must sum to 1' }, { status: 400 });
    }

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: '1d' as const,
    };

    const assetDataPromises = tickers.map(async (t: string) => {
      try {
        return await yahooFinance.historical(t, queryOptions);
      } catch (e: any) {
        if (e.message && e.message.includes('No data found')) {
          throw new Error(`No data found for ticker ${t}. It may be delisted or invalid.`);
        }
        throw e;
      }
    });
    const assetDataResults: any[][] = await Promise.all(assetDataPromises);
    
    // Fetch risk-free rate
    let riskFreeRate = 0.04; // Default 4%
    try {
      const rfrData: any = await yahooFinance.quote(riskFreeRateSource);
      if (rfrData && rfrData.regularMarketPrice) {
        riskFreeRate = rfrData.regularMarketPrice / 100;
      }
    } catch (e) {
      console.warn('Could not fetch risk-free rate, using default 4%');
    }

    // Align dates based on the first ticker
    const dates = assetDataResults[0].map(d => d.date.toISOString().split('T')[0]);
    
    const allReturns: number[][] = [];
    const annVols: number[] = [];
    const annMeans: number[] = [];

    for (let i = 0; i < tickers.length; i++) {
      const data = assetDataResults[i];
      const dataMap = new Map(data.map(d => [d.date.toISOString().split('T')[0], d.adjClose || d.close]));
      
      let lastPrice = dataMap.get(dates[0]) || 1;
      const prices = dates.map(d => {
        const p = dataMap.get(d);
        if (p !== undefined) {
          lastPrice = p;
          return p;
        }
        return lastPrice;
      });

      const ret = returns(prices, false).slice(1);
      allReturns.push(ret);
      annVols.push(std(ret) * Math.sqrt(252));
      annMeans.push(mean(ret) * 252);
    }

    const n = tickers.length;
    const covMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    const corMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        covMatrix[i][j] = covariance(allReturns[i], allReturns[j]) * 252; // Annualized covariance
        corMatrix[i][j] = correlation(allReturns[i], allReturns[j]);
      }
    }

    // Portfolio Variance: w^T * Cov * w
    const wMatrix = [weights]; // 1 x n
    const wTMatrix = transpose(wMatrix); // n x 1
    const covW = matrixMult(covMatrix, wTMatrix); // n x 1
    const portVarMatrix = matrixMult(wMatrix, covW); // 1 x 1
    const portVar = portVarMatrix[0][0];
    const portVol = Math.sqrt(portVar);

    // Marginal Risk Contribution: (Cov * w) / portVol
    const mrc = covW.map(row => row[0] / portVol);
    
    // Percentage Risk Contribution: (w * mrc) / portVol
    const prc = weights.map((w: number, i: number) => (w * mrc[i]) / portVol);

    const portReturn = weights.reduce((sum: number, w: number, i: number) => sum + w * annMeans[i], 0);
    const sharpeRatio = portVol === 0 ? 0 : (portReturn - riskFreeRate) / portVol;

    // Efficient Frontier Simulation (Random Portfolios)
    const efficientFrontier = [];
    for (let i = 0; i < 2000; i++) {
      const rw = Array(n).fill(0).map(() => Math.random());
      const sumRw = rw.reduce((a, b) => a + b, 0);
      const normRw = rw.map(w => w / sumRw);
      
      const rWMatrix = [normRw];
      const rWTMatrix = transpose(rWMatrix);
      const rCovW = matrixMult(covMatrix, rWTMatrix);
      const rPortVar = matrixMult(rWMatrix, rCovW)[0][0];
      const rPortVol = Math.sqrt(rPortVar);
      const rPortRet = normRw.reduce((sum, w, idx) => sum + w * annMeans[idx], 0);
      
      efficientFrontier.push({
        volatility: rPortVol,
        return: rPortRet,
        sharpe: (rPortRet - riskFreeRate) / rPortVol,
        weights: normRw
      });
    }

    // Sort by volatility for plotting
    efficientFrontier.sort((a, b) => a.volatility - b.volatility);

    // Extract the upper edge (the actual efficient frontier)
    const upperEdge = [];
    let maxRet = -Infinity;
    for (const pt of efficientFrontier) {
      if (pt.return > maxRet) {
        upperEdge.push(pt);
        maxRet = pt.return;
      }
    }

    return NextResponse.json({
      individual: tickers.map((t: string, i: number) => ({
        ticker: t,
        annualizedVolatility: annVols[i],
        annualizedReturn: annMeans[i],
        weight: weights[i],
        marginalRiskContribution: mrc[i],
        percentageRiskContribution: prc[i]
      })),
      portfolio: {
        variance: portVar,
        volatility: portVol,
        expectedReturn: portReturn,
        sharpeRatio,
        riskFreeRate
      },
      matrices: {
        covariance: covMatrix,
        correlation: corMatrix
      },
      efficientFrontier: upperEdge,
      scatterPoints: efficientFrontier.filter((_, i) => i % 10 === 0) // Downsample for scatter plot
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
