const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function groupLinkHTML(group, fallback = 'Groupe historique') {
  return group ? `<button class="text-button group-link" data-group-select="${esc(group.id)}">${esc(group.name)} · ${esc(group.genre)} ↗</button>` : esc(fallback);
}
