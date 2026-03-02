export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function variance(arr: number[], sample = true): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const sum = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0);
  return sum / (arr.length - (sample ? 1 : 0));
}

export function std(arr: number[], sample = true): number {
  return Math.sqrt(variance(arr, sample));
}

export function covariance(arr1: number[], arr2: number[], sample = true): number {
  if (arr1.length !== arr2.length || arr1.length <= 1) return 0;
  const m1 = mean(arr1);
  const m2 = mean(arr2);
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += (arr1[i] - m1) * (arr2[i] - m2);
  }
  return sum / (arr1.length - (sample ? 1 : 0));
}

export function correlation(arr1: number[], arr2: number[]): number {
  const cov = covariance(arr1, arr2);
  const s1 = std(arr1);
  const s2 = std(arr2);
  if (s1 === 0 || s2 === 0) return 0;
  return cov / (s1 * s2);
}

export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= sorted.length) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function maxDrawdown(prices: number[]): number {
  let maxPrice = 0;
  let maxDD = 0;
  for (const p of prices) {
    if (p > maxPrice) maxPrice = p;
    const dd = (maxPrice - p) / maxPrice;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function rollingStd(arr: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const slice = arr.slice(i - window + 1, i + 1);
      result.push(std(slice));
    }
  }
  return result;
}

export function returns(prices: number[], log = false): number[] {
  const result: number[] = [0]; // First day return is 0 or NaN, let's use 0 for alignment
  for (let i = 1; i < prices.length; i++) {
    if (log) {
      result.push(Math.log(prices[i] / prices[i - 1]));
    } else {
      result.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  return result;
}

export function matrixMult(A: number[][], B: number[][]): number[][] {
  const aRows = A.length;
  const aCols = A[0].length;
  const bRows = B.length;
  const bCols = B[0].length;
  if (aCols !== bRows) throw new Error("Incompatible matrices");
  const result = new Array(aRows).fill(0).map(() => new Array(bCols).fill(0));
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

export function transpose(A: number[][]): number[][] {
  return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
}

export function simulateGBM(S0: number, mu: number, sigma: number, days: number, paths: number) {
  const dt = 1 / 252;
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const vol = sigma * Math.sqrt(dt);
  
  const finalPrices = new Float64Array(paths);
  const maxDrawdowns = new Float64Array(paths);
  
  // Box-Muller transform for normal random variables
  function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  }

  const samplePaths: number[][] = [];

  for (let p = 0; p < paths; p++) {
    let S = S0;
    let maxS = S0;
    let maxDD = 0;
    const path = [S0];
    
    for (let d = 0; d < days; d++) {
      const Z = randn_bm();
      S = S * Math.exp(drift + vol * Z);
      if (S > maxS) maxS = S;
      const dd = (maxS - S) / maxS;
      if (dd > maxDD) maxDD = dd;
      
      if (p < 50) { // save first 50 paths
        path.push(S);
      }
    }
    
    finalPrices[p] = S;
    maxDrawdowns[p] = maxDD;
    if (p < 50) {
      samplePaths.push(path);
    }
  }
  
  return { finalPrices: Array.from(finalPrices), maxDrawdowns: Array.from(maxDrawdowns), samplePaths };
}
