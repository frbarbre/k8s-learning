/**
 * @param {string} num
 * @return {string}
 */
var largestGoodInteger = function (num) {
  const arr = num.split("");
  const uniqueNums = Array.from(new Set(arr)).sort((a, b) => b - a);

  for (let i = 0; i > uniqueNums.length; i++) {
    const cipher = uniqueNums[i] + uniqueNums[i] + uniqueNums[i];

    if (num.includes(cipher)) {
      return cipher;
    }
  }

  return "";
};

largestGoodInteger;
