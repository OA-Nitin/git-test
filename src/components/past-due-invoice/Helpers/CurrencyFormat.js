export const formatUSD = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0.00";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
