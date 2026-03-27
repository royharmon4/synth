const KEY = "neon-pocket-workstation-patterns-v1";

export function listSavedPatterns() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePattern(name, pattern) {
  const entries = listSavedPatterns().filter((p) => p.name !== name);
  entries.push({ name, pattern, savedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function loadPatternByName(name) {
  const hit = listSavedPatterns().find((entry) => entry.name === name);
  return hit?.pattern;
}
