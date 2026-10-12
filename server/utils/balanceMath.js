export function netBalance({ paid = 0, owed = 0, settledPaid = 0, settledReceived = 0 }) {
  return paid - owed + settledPaid - settledReceived;
}