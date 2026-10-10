export function toPaise(rupees) {
  if (typeof rupees !== 'number' || !Number.isFinite(rupees)) {
    throw new TypeError('Rupees must be a finite number');
  }
  return Math.round(rupees * 100);
}

export function fromPaise(paise) {
  if (!Number.isSafeInteger(paise)) {
    throw new TypeError('Paise must be a safe integer');
  }
  return paise / 100;
}