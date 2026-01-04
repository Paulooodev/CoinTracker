// Format price based on currency and exchange rate
export const formatPrice = (price, currency, exchangeRate = 1, valueIsUsd = true) => {
  const priceNum = Number(price);
  let convertedPrice = priceNum;
  const safeRate = Number(exchangeRate) || 1;

  if (valueIsUsd && currency === 'NGN') {
    convertedPrice = priceNum * safeRate;
  }

  if(isNaN(convertedPrice)) return 'NaN'

  const fixed =
    convertedPrice < 0.001
      ? convertedPrice.toFixed(6)
      : convertedPrice < 1
        ? convertedPrice.toFixed(4)
        : convertedPrice.toFixed(2);

  return parseFloat(fixed).toLocaleString(undefined, {
    minimumFractionDigits: fixed.split('.')[1]?.length || 2,
  });
};

// Formatting coins on their 24hr price change
export const getChangeColor = (change) => {
  if(change === null || change === undefined) {
    return 'gray';
  }
    return change >= 0 ? 'green' : 'red';
};

export const format24hChange = (change) => {
   if(change === null || change === undefined) {
    return 'N/A';
  }
    const rounded = change.toFixed(2) + '%';
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${rounded}`;
}

// MarketCap format 
export const formatMarketCap = (number, currency) => {
    if(!number) return '-';
    const isNGN = currency === 'NGN'
    return isNGN
        ? number.toLocaleString('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 2,
        })
        : number.toLocaleString();
};
