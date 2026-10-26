const DECIMAL = /^\d+$/;
export function canonicalId(value) {
  const s = String(value ?? "").trim();
  if (!DECIMAL.test(s)) throw new TypeError("Identifiers must contain decimal digits only.");
  return s.replace(/^0+(?=\d)/, "");
}
export function isDecimalId(value) { return typeof value === "string" && DECIMAL.test(value.trim()); }
export function compareDecimal(a, b) {
  a = canonicalId(a); b = canonicalId(b);
  return a.length === b.length ? (a === b ? 0 : a < b ? -1 : 1) : a.length < b.length ? -1 : 1;
}
export function incrementDecimal(value) {
  const digits = canonicalId(value).split("");
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] !== "9") { digits[i] = String(Number(digits[i]) + 1); return digits.join(""); }
    digits[i] = "0";
  }
  return "1" + digits.join("");
}
export function decrementDecimal(value) {
  let s = canonicalId(value);
  if (s === "0") return "0";
  const d = s.split("");
  for (let i=d.length-1;i>=0;i--) {
    if (d[i] !== "0") { d[i] = String(Number(d[i])-1); break; }
    d[i] = "9";
  }
  return d.join("").replace(/^0+(?=\d)/, "");
}
export function addDecimalSmall(value, amount) {
  let out = canonicalId(value);
  let n = BigInt(amount);
  // Chunked decimal-string arithmetic avoids converting the identifier itself to Number.
  while (n > 0n) {
    const chunk = n > 999999999n ? 999999999n : n;
    let carry = Number(chunk);
    const chars = out.split("");
    for (let i=chars.length-1;i>=0 && carry;i--) {
      const sum = Number(chars[i]) + carry;
      chars[i] = String(sum % 10);
      carry = Math.floor(sum / 10);
    }
    while (carry) { chars.unshift(String(carry % 10)); carry = Math.floor(carry/10); }
    out = chars.join("");
    n -= chunk;
  }
  return out;
}
export function parseEntityPath(pathname) {
  const p = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (!p.length || p[0] === "galaxies") return { phase:"galaxy" };
  if (p[0] !== "galaxy" || !p[1] || !isDecimalId(p[1])) return { phase:"galaxy" };
  if (p[2] === "planet" && p[3] && isDecimalId(p[3])) {
    if (p[4] === "profile" && p[5] && isDecimalId(p[5])) return {phase:"detail",galaxyId:canonicalId(p[1]),planetId:canonicalId(p[3]),profileId:canonicalId(p[5])};
    return {phase:"profile",galaxyId:canonicalId(p[1]),planetId:canonicalId(p[3])};
  }
  return {phase:"planet",galaxyId:canonicalId(p[1])};
}
export function entityPath(entity) {
  if (entity.phase === "galaxy") return "/galaxies";
  const base = `/galaxy/${encodeURIComponent(entity.galaxyId)}`;
  if (entity.phase === "planet") return base;
  const p = `${base}/planet/${encodeURIComponent(entity.planetId)}`;
  if (entity.phase === "detail") return `${p}/profile/${encodeURIComponent(entity.profileId)}`;
  return p;
}
