import { NextResponse } from 'next/server';
import { simulateGBM } from '@/lib/math';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { S0, mu, sigma, days = 252, paths = 10000 } = body;

    if (S0 === undefined || mu === undefined || sigma === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { finalPrices, maxDrawdowns, samplePaths } = simulateGBM(S0, mu, sigma, days, paths);

    // Calculate histogram data for final prices
    const minPrice = Math.min(...finalPrices);
    const maxPrice = Math.max(...finalPrices);
    const bins = 50;
    const binSize = (maxPrice - minPrice) / bins;
    
    const histogram = Array(bins).fill(0);
    for (const p of finalPrices) {
      const binIndex = Math.floor((p - minPrice) / binSize);
      if (binIndex >= bins) histogram[bins - 1]++;
      else histogram[binIndex]++;
    }

    const histogramData = histogram.map((count, i) => ({
      bin: minPrice + i * binSize + binSize / 2,
      count
    }));

    const expectedDrawdown = maxDrawdowns.reduce((a, b) => a + b, 0) / paths;
    const expectedReturn = (finalPrices.reduce((a, b) => a + b, 0) / paths) / S0 - 1;

    return NextResponse.json({
      histogramData,
      samplePaths,
      expectedDrawdown,
      expectedReturn,
      finalPricesSummary: {
        min: minPrice,
        max: maxPrice,
        mean: finalPrices.reduce((a, b) => a + b, 0) / paths
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
