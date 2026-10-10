// Phase 4 replaces these stubs with expense and settlement balance calculations.
export async function getMemberNetBalance(_groupId, _memberId) {
  return 0;
}

export async function groupHasUnsettledBalances(_groupId) {
  return false;
}

// Phase 3/5 will update expense and settlement references in this transaction.
export async function mergeMemberHistory(_details) {}