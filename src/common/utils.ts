/**
 * Check if all elements in the array are equal to each other
 * @param arr
 * @returns {boolean}
 */
export const allEqual = (arr: any[]): boolean => {
  if (arr.length === 0) return false;
  return arr.every((v) => v === arr[0]);
};

/**
 * A helper function to generate an array of indices with length E.g: [0,1,2,3,4]
 * @param length Array length
 * @param isAsc indices order.
 * @returns return [0, 1, 2, ...] if isAsc == true, else returns [..., 2, 1, 0]
 */
export const getIndicesArr = (length: number, isAsc: boolean) => {
  const res = Array(length)
    .fill(null)
    .map((_, idx) => idx);
  return isAsc ? res : res.reverse();
};

/**
 * A helper function to generate an array with length E.g: [0,1,2,3,4]
 * @param length Array length
 * @param value Array init value, (default = null)
 * @returns return [value, value, value, ...]
 */
export const generateArr = (length: number, value: any = null) => {
  return Array(length).fill(value);
};
