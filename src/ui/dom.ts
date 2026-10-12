export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

export function link(cls: string, href: string, text: string): HTMLAnchorElement {
  const a = h('a', cls, text);
  a.href = href;
  return a;
}
