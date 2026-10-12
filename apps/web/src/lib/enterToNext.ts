// Enter moves to the next field instead of submitting a form.
//
// One listener for the whole site. Pressing Enter in a text-like <input>
// inside a <form>, a dialog, or a group of fields on a page (the calculators)
// focuses the next field. On the last field it does nothing, so a form is
// only submitted by its button, except sign-in style forms (they hold a
// password box), where Enter on the last field still submits.
//
// Left alone: textareas (Enter is a new line), buttons and checkboxes,
// search boxes and chat/command inputs (Enter runs the search or sends the
// message), and a lone field in its form. Anything can opt out with
// `data-enter="native"`.

const SKIP_TYPES = new Set(['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'range', 'image', 'color', 'search', 'hidden']);
const FIELD_SELECTOR = [
  'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=image]):not([type=color])',
  'textarea',
  'select',
  'button[role=combobox]',
].join(',');

function isFillable(el: HTMLElement): boolean {
  if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).readOnly) return false;
  if (el.getAttribute('aria-hidden') === 'true' || el.tabIndex < 0) return false;
  return el.getClientRects().length > 0;
}

function isSearchLike(el: HTMLInputElement): boolean {
  if (el.getAttribute('enterkeyhint') === 'search' || el.closest('[role=search], [cmdk-root], [role=listbox]')) return true;
  return /search|ask|message|chat|type a/i.test(`${el.placeholder} ${el.getAttribute('aria-label') || ''}`);
}

function fillableFields(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(
    (f) => isFillable(f) && !(f instanceof HTMLInputElement && (SKIP_TYPES.has(f.type) || isSearchLike(f))),
  );
}

// The group of fields this input belongs to: its form, its dialog, or (for
// pages without a form, like the calculators) the tightest container that
// holds a handful of fields. Never the whole page, so unrelated inputs far
// apart (two newsletter boxes, say) aren't chained together.
function findScope(el: HTMLInputElement): HTMLElement | null {
  const fixed = el.form ?? el.closest<HTMLElement>('[role=dialog], [role=alertdialog]');
  if (fixed) return fixed;
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    if (node.tagName === 'MAIN' || node.id === 'root') return null;
    const count = fillableFields(node).length;
    if (count > 14) return null;
    if (count >= 2) return node;
  }
  return null;
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.defaultPrevented) return;
  const el = e.target;
  if (!(el instanceof HTMLInputElement)) return;
  if (SKIP_TYPES.has(el.type) || el.dataset.enter === 'native' || el.closest('[data-enter=native]') || isSearchLike(el)) return;

  const scope = findScope(el);
  if (!scope) return;
  const fields = fillableFields(scope);
  const index = fields.indexOf(el);
  if (index === -1 || fields.length < 2) return; // a lone field keeps its default (Enter submits/searches)

  const next = fields[index + 1];
  if (next) {
    e.preventDefault();
    next.focus();
    if (next instanceof HTMLInputElement && typeof next.select === 'function' && next.type !== 'date' && next.type !== 'time') {
      try { next.select(); } catch { /* some input types can't select */ }
    }
    return;
  }

  // Last field. A sign-in form (it has a password box) still submits; any other form waits for its button.
  const isAuthForm = !!el.form?.querySelector('input[type=password]');
  if (el.form && !isAuthForm) e.preventDefault();
}

let installed = false;

export function installEnterToNext() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('keydown', onKeyDown);
}
