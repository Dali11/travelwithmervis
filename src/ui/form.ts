import { content } from '../content';

function value(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return (el?.value ?? '').trim();
}

function message(): string {
  const chosen = document.querySelector<HTMLInputElement>('input[name="trip"]:checked');
  const lines = [content.plan.whatsappGreeting];
  if (value('name')) lines.push(`Name: ${value('name')}`);
  if (chosen) lines.push(`Trip type: ${chosen.value}`);
  if (value('dates')) lines.push(`Dates: ${value('dates')}`);
  if (value('group')) lines.push(`Travellers: ${value('group')}`);
  return lines.join('\n');
}

/** Wires the enquiry form: WhatsApp link, trip buttons, copy fallback. */
export function setupForm(): void {
  const send = document.getElementById('send') as HTMLAnchorElement | null;
  const status = document.getElementById('status');
  if (!send || !status) return;

  const updateLink = (): void => {
    if (!content.whatsapp) return;
    send.href = `https://wa.me/${content.whatsapp}?text=${encodeURIComponent(message())}`;
    send.target = '_blank';
    send.rel = 'noopener';
  };

  ['name', 'dates', 'group'].forEach((id) => document.getElementById(id)?.addEventListener('input', updateLink));
  document.querySelectorAll<HTMLInputElement>('input[name="trip"]').forEach((r) => r.addEventListener('change', updateLink));

  document.querySelectorAll<HTMLElement>('[data-trip]').forEach((a) => {
    a.addEventListener('click', () => {
      const v = a.getAttribute('data-trip');
      document.querySelectorAll<HTMLInputElement>('input[name="trip"]').forEach((r) => {
        r.checked = r.value === v;
      });
      updateLink();
    });
  });

  send.addEventListener('click', (e) => {
    if (content.whatsapp) {
      updateLink();
      return;
    }
    e.preventDefault();
    const msg = message();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(msg).then(
        () => {
          status.textContent = content.plan.copied;
        },
        () => {
          status.textContent = msg;
        },
      );
    } else {
      status.textContent = msg;
    }
  });
}
