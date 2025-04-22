const whitelist = ["trustedwebsite.com"];
const blacklist = ["example.com", "trackingwebsite.com"];

export function shouldInjectScript(url) {
  if (!url || !url.startsWith("http")) return false;

  try {
    const hostname = new URL(url).hostname;
    if (whitelist.some(site => hostname.includes(site))) return false;
    if (blacklist.length === 0 || blacklist.some(site => hostname.includes(site))) return true;
    return false;
  } catch {
    return false;
  }
}
