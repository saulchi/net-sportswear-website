import { collections } from './catalog.js';

export function initNavigation() {
  const header = document.querySelector('header');
  const nav = document.querySelector('#navigation');
  const toggle = document.querySelector('.menu-toggle');
  const mobile = window.matchMedia('(max-width: 760px)');
  const triggers = [];
  let active;
  let pinned = false;
  function closeMenu(restoreFocus = false) {
    const previous = active;
    if (active) {
      active.setAttribute('aria-expanded', 'false');
      document.getElementById(active.getAttribute('aria-controls')).hidden = true;
    }
    active = null; pinned = false;
    if (restoreFocus) previous?.focus();
  }
  function openMenu(trigger, pin = false) {
    if (active !== trigger) closeMenu();
    active = trigger; pinned = pin;
    trigger.setAttribute('aria-expanded', 'true');
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
  }
  function closeNavigation() {
    closeMenu();
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }
  for (const category of Object.keys(collections)) {
    const original = [...nav.children].find(link => link.textContent === category);
    if (!original) continue;
    const group = document.createElement('div'); group.className = 'nav-product';
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'mega-trigger'; trigger.textContent = category;
    trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', `mega-${category.toLowerCase()}`);
    const chevron = document.createElement('span'); chevron.className = 'mega-chevron'; chevron.setAttribute('aria-hidden', 'true');chevron.textContent = '+';trigger.append(chevron);
    const panel = document.createElement('div');panel.className = 'mega-panel';panel.id = `mega-${category.toLowerCase()}`;panel.hidden = true;
    const intro = document.createElement('div');intro.className = 'mega-intro';
    const label = document.createElement('p');label.className = 'eyebrow';label.textContent = 'OEM / ODM COLLECTIONS';
    const title = document.createElement('h2');title.textContent = category;
    const description = document.createElement('p');description.textContent = 'Purposeful apparel, developed around your brand.';intro.append(label,title,description);
    const columns = document.createElement('div');columns.className = 'mega-columns';
    for (const gender of ['Men', 'Women']) {
      const column = document.createElement('section');column.className = 'mega-column';column.setAttribute('aria-label', `${category} ${gender}`);
      const heading = document.createElement('h3');heading.textContent = gender.toUpperCase();column.append(heading);
      for (const subcategory of Object.keys(collections[category].types)) {
        const link = document.createElement('a');
        link.textContent = subcategory;
        link.href = `${import.meta.env.BASE_URL}products.html?${new URLSearchParams({ category, gender, subcategory })}`;
        column.append(link);
      }
      columns.append(column);
    }
    panel.append(intro,columns);group.append(trigger,panel);original.replaceWith(group);triggers.push(trigger);
    group.addEventListener('pointerenter', event => {
      if (!mobile.matches && event.pointerType === 'mouse') openMenu(trigger);
    });
    trigger.addEventListener('click', () => {
      if (active === trigger && (pinned || mobile.matches)) closeMenu();
      else openMenu(trigger, true);
    });
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();openMenu(trigger,true);panel.querySelector('a').focus();
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = triggers[(triggers.indexOf(trigger) + direction + triggers.length) % triggers.length];
        openMenu(next,true);next.focus();
      }
    });
  }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    closeMenu();nav.classList.toggle('open',expanded);toggle.setAttribute('aria-expanded',String(expanded));
    toggle.setAttribute('aria-label',expanded ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click',closeNavigation);
    if (!link.closest('.mega-panel')) link.addEventListener('pointerenter', () => { if (!mobile.matches) closeMenu(); });
  });
  header.addEventListener('pointerleave', () => { if (!mobile.matches && !pinned && !header.contains(document.activeElement)) closeMenu(); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeNavigation(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (active) { event.preventDefault();closeMenu(true); }
    else if (nav.classList.contains('open')) { closeNavigation();toggle.focus(); }
  });
  header.addEventListener('focusout', () => setTimeout(() => { if (!header.contains(document.activeElement)) closeMenu(); }, 0));
  mobile.addEventListener('change',closeNavigation);
}
