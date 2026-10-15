export function buildMemberLookup(group) {
  const list = Array.isArray(group) ? group : (group?.members ?? []);
  const map = new Map(list.map((member) => [String(member._id), member]));
  return {
    get: (id) => map.get(String(id)),
    name: (id) => map.get(String(id))?.name ?? "Former member",
  };
}

export const findMe = (group, user) => {
  if (!group || !user) return null;
  const list = Array.isArray(group) ? group : (group.members ?? []);
  const userId = String(user._id ?? user.id ?? user);
  return list.find((member) => String(member.user?._id ?? member.user ?? "") === userId) ?? null;
};

export function buildParticipants(group, me, expense) {
  if (!group) return [];
  const list = Array.isArray(group) ? group : (group.members ?? []);
  const meId = me ? String(me._id ?? me) : null;
  const active = [...list].sort((a, b) => {
    if (meId && String(a._id) === meId) return -1;
    if (meId && String(b._id) === meId) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });
  if (!expense) return active;

  const known = new Set(active.map((member) => String(member._id)));
  const former = [];
  const add = (id) => {
    const key = String(id);
    if (!key || known.has(key)) return;
    known.add(key);
    former.push({
      _id: key,
      name: `Former member ${former.length + 1}`,
      isPlaceholder: false,
      isFormer: true,
    });
  };
  (expense.paidBy || []).forEach((p) => add(p.member));
  (expense.splits || []).forEach((s) => add(s.member));

  return [...active, ...former];
}
