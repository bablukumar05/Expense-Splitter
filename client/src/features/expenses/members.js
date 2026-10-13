export function buildMemberLookup(group) {
  const map = new Map(group.members.map((member) => [String(member._id), member]));
  return {
    get: (id) => map.get(String(id)),
    name: (id) => map.get(String(id))?.name ?? "Former member",
  };
}

export const findMe = (group, user) => group.members.find((member) => member.user?._id === user._id);

export function buildParticipants(group, me, expense) {
  const active = [...group.members].sort((a, b) => {
    if (a._id === me._id) return -1;
    if (b._id === me._id) return 1;
    return a.name.localeCompare(b.name);
  });
  if (!expense) return active;

  const known = new Set(active.map((member) => String(member._id)));
  const former = [];
  const add = (id) => {
    const key = String(id);
    if (known.has(key)) return;
    known.add(key);
    former.push({
      _id: key,
      name: `Former member ${former.length + 1}`,
      isPlaceholder: false,
      isFormer: true,
    });
  };
  expense.paidBy.forEach((p) => add(p.member));
  expense.splits.forEach((s) => add(s.member));

  return [...active, ...former];
}
