/* ─── Connect to Xenia ───────────────────────────────────────────────
   Paste the hotel's Website Booking key (Xenia → Settings → Website Bookings).
   Left empty, the site runs on the sample rooms below so it can be shown. */
const XENIA = { api: 'https://api.xenia.ng/api/v1/public/booking/v1', key: '' };

/* Rooms as listed for Kiniz online (Crystalbeds rates, Booking.com sizes). Confirm with the hotel.
   kind: 'hotel' = hotel room, serviced daily, no kitchen. 'apartment' = a home with its own kitchen and living room. */
const ROOMS = [
  { roomTypeId:'single', kind:'hotel', name:'Luxury Single Room', maxAdults:2, ratePerNight:88550, sqm:10, bedrooms:1, baths:1, bed:'1 king bed', img:'images/room-single.jpg',
    lines:['King bed','En-suite bathroom','Work desk','Balcony'],
    about:'A hotel room for one or two, cleaned every day. Right for a business trip or a night or two in Uyo.',
    has:['Air conditioning','Smart TV','Free Wi-Fi','Work desk','Balcony with city view','In-room safe','Daily housekeeping','Room service'] },
  { roomTypeId:'apt1', kind:'apartment', name:'One-Bedroom Apartment', maxAdults:3, ratePerNight:164450, sqm:20, bedrooms:1, baths:1, bed:'1 queen bed + sofa bed', img:'images/apt-1bed.jpg',
    lines:['1 bedroom','Kitchen','Living room','Up to 3 guests'],
    about:'Your own small home: a bedroom, a living room with a sofa bed and a kitchen. Good for couples and longer stays.',
    has:['Kitchen','Living room','Sofa bed','Air conditioning','Smart TV','Free Wi-Fi','Balcony','Weekly laundry on request'] },
  { roomTypeId:'apt2', kind:'apartment', name:'Two-Bedroom Apartment', maxAdults:4, ratePerNight:265650, sqm:30, bedrooms:2, baths:2, bed:'2 double beds + sofa bed', img:'images/apt-2bed.jpg',
    lines:['2 bedrooms','Kitchen','Living and dining','Up to 4 guests'],
    about:'Two bedrooms, a shared living room and a kitchen. Built for small families and friends travelling together.',
    has:['Kitchen','Living and dining room','Two bathrooms','Balcony','Air conditioning','Smart TV','Free Wi-Fi','Sofa bed'] },
  { roomTypeId:'apt3', kind:'apartment', name:'Three-Bedroom Apartment', maxAdults:6, ratePerNight:328900, sqm:40, bedrooms:3, baths:3, bed:'3 bedrooms', img:'images/apt-3bed.jpg',
    lines:['3 bedrooms','Kitchen','Living and dining','Up to 6 guests'],
    about:'Room for the whole family: three bedrooms, a big living room, a dining table and a kitchen.',
    has:['Kitchen','Large living room','Dining for six','Three bathrooms','Balcony','Air conditioning','Smart TVs','Free Wi-Fi'] },
  { roomTypeId:'apt4', kind:'apartment', name:'Four-Bedroom Luxury Apartment', maxAdults:8, ratePerNight:480700, sqm:50, bedrooms:4, baths:4, bed:'4 bedrooms', img:'images/apt-4bed.jpg',
    lines:['4 bedrooms','Kitchen','Living and dining','Up to 8 guests'],
    about:'The largest home at Kiniz. Four bedrooms with connecting rooms, for big families, teams and wedding guests.',
    has:['Kitchen','Living and dining room','Four bathrooms','Connecting rooms','Air conditioning','Smart TVs','Free Wi-Fi','Balcony'] },
];
const KIND = { hotel:'Hotel room', apartment:'Serviced apartment' };

const $ = (id) => document.getElementById(id);
const naira = (n) => '₦' + Math.round(n).toLocaleString('en-NG');
const live = !!XENIA.key;
const st = { search:null, avail:null, pick:null, hold:null };
const page = document.body.dataset.page || 'home';

/* ── shared header, footer, booking panel ── */
const LOGO = `<img class="mark" src="images/kiniz-mark.png" alt="" width="56" height="30">`;
const LINKS = [['home','index.html','Home'],['rooms','rooms.html','Rooms'],['dining','dining.html','Pool & Dining'],['gallery','gallery.html','Gallery'],['contact','contact.html','Contact']];
document.body.insertAdjacentHTML('afterbegin', `
<header id="hdr" class="${page === 'home' ? '' : 'solid'}">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="Kiniz Apartments and Hotel, home">${LOGO}<span><b>KINIZ</b><small>LUXURY APARTMENTS &amp; HOTELS</small></span></a>
    <nav>
      ${LINKS.map(([k, h, t]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
      <button class="btn" data-open>Book now</button>
      <button class="menu" id="menu" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
    </nav>
  </div>
</header>
<div class="sheet" id="sheet">${LINKS.map(([k, h, t]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</div>`);

document.body.insertAdjacentHTML('beforeend', `
<footer>
  <div class="wrap foot">
    <div><img class="flogo" src="images/kiniz-logo.png" alt="Kiniz Luxury Apartments" width="180" height="127">
      <p>20 Basumoh Gas Road, off Oron Road,<br>Osong Ama Estate, Uyo 520102, Akwa Ibom</p></div>
    <div><h4>Visit</h4>${LINKS.map(([, h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
    <div><h4>Hotel</h4>${ROOMS.filter((r) => r.kind === 'hotel').map((r) => `<a href="rooms.html#${r.roomTypeId}">${r.name}</a>`).join('')}<h4 style="margin-top:22px">Apartments</h4>${ROOMS.filter((r) => r.kind === 'apartment').map((r) => `<a href="rooms.html#${r.roomTypeId}">${r.name.replace(' Apartment','').replace(' Luxury','')}</a>`).join('')}</div>
    <div><h4>Times</h4><p>Check in from 3:00 pm<br>Check out by 11:00 am<br>Front desk open 24 hours</p></div>
  </div>
  <div class="wrap fine"><span>© ${new Date().getFullYear()} Kiniz Luxury Apartments &amp; Hotels, Uyo</span><span>Bookings powered by <a href="https://xenia.ng" target="_blank" rel="noopener">Xenia</a></span></div>
</footer>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Book your stay" aria-live="polite">
  <div class="dtop"><span class="kicker">Book your stay</span><button class="x" id="close" aria-label="Close">×</button></div>
  <div class="steps"><i id="s1" class="on"></i><i id="s2"></i><i id="s3"></i></div>
  <form id="f-dates" novalidate>
    <h3>When are you coming?</h3>
    <p class="sub">Book direct for the best rate. Pay when you arrive.</p>
    <div class="two">
      <div class="fld"><label for="dci">Check in</label><input id="dci" type="date" required></div>
      <div class="fld"><label for="dco">Check out</label><input id="dco" type="date" required></div>
    </div>
    <div class="fld"><label for="dad">Guests</label><select id="dad">${[1,2,3,4,5,6,7,8].map((n) => `<option value="${n}"${n === 2 ? ' selected' : ''}>${n} guest${n > 1 ? 's' : ''}</option>`).join('')}</select></div>
    <button class="btn" type="submit" id="dgo">See rooms</button>
    <div id="m0"></div>
  </form>
  <div id="f-pick" hidden>
    <h3>Choose your stay</h3>
    <p class="sub" id="pick-sub"></p>
    <div id="opts"></div>
    <div id="m2"></div>
    <button class="btn" id="to-details" disabled>Continue</button>
    <button class="link" type="button" data-back="dates">Change dates</button>
  </div>
  <form id="f-guest" hidden novalidate>
    <h3>Your details</h3>
    <p class="sub" id="guest-sub"></p>
    <div class="fld"><label for="gn">Full name</label><input id="gn" autocomplete="name" required></div>
    <div class="two">
      <div class="fld"><label for="gp">Phone</label><input id="gp" type="tel" autocomplete="tel" placeholder="080…" required></div>
      <div class="fld"><label for="ge">Email</label><input id="ge" type="email" autocomplete="email"></div>
    </div>
    <div class="fld"><label for="gx">Notes for the hotel</label><textarea id="gx" rows="2" placeholder="Arrival time, airport pickup…"></textarea></div>
    <div class="sum" id="sum"></div>
    <button class="btn" type="submit" id="confirm">Confirm booking</button>
    <p class="note">No payment now. The front desk will send details for the 50% deposit that secures your stay.</p>
    <div id="m3"></div>
    <button class="link" type="button" data-back="pick">Change room</button>
  </form>
  <div id="f-done" hidden>
    <div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div>
    <h3>You're booked</h3>
    <p class="sub" id="done-sub"></p>
    <div class="code" id="done-code"></div>
    <div class="sum" id="done-sum"></div>
    <p class="note">Show this code at the front desk.</p>
    <button class="link" id="again">Close</button>
  </div>
</aside>`);

/* header + mobile menu */
const hdr = $('hdr');
if (page === 'home') { const onScroll = () => hdr.classList.toggle('solid', scrollY > 40); addEventListener('scroll', onScroll, { passive:true }); onScroll(); }
$('menu').onclick = () => { const on = $('sheet').classList.toggle('on'); hdr.classList.toggle('open', on); $('menu').setAttribute('aria-expanded', on); };

/* ── booking ── */
async function api(path, opts = {}) {
  const r = await fetch(XENIA.api + path, { ...opts, headers: { 'Content-Type':'application/json', Authorization:'Bearer ' + XENIA.key, ...(opts.headers||{}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(Array.isArray(j.message) ? j.message.join(' ') : (j.message || 'Something went wrong. Try again.'));
  return j.data;
}
const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const fmtDay = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
const msg = (el, text, kind = 'err') => { $(el).innerHTML = text ? `<div class="msg ${kind}"></div>` : ''; if (text) $(el).firstChild.textContent = text; };
const iso = (d) => d.toISOString().slice(0, 10);

function openDrawer() { $('drawer').classList.add('on'); $('scrim').classList.add('on'); document.body.style.overflow = 'hidden'; }
function closeDrawer() { $('drawer').classList.remove('on'); $('scrim').classList.remove('on'); document.body.style.overflow = ''; }
$('close').onclick = closeDrawer; $('scrim').onclick = closeDrawer; $('again').onclick = closeDrawer;
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
function show(step) {
  ['dates','pick','guest','done'].forEach((s) => $('f-' + s).hidden = s !== step);
  const n = { dates:1, pick:1, guest:2, done:3 }[step];
  ['s1','s2','s3'].forEach((s, i) => $(s).classList.toggle('on', i < n));
  $('drawer').scrollTop = 0;
}

/* date pairs: the drawer's, and the hero bar's when the page has one */
function wireDates(ci, co) {
  if (!$(ci)) return;
  $(ci).value = iso(new Date()); $(co).value = iso(new Date(Date.now() + 864e5));
  $(ci).min = $(ci).value; $(co).min = $(co).value;
  $(ci).addEventListener('change', () => {
    const next = iso(new Date(new Date($(ci).value).getTime() + 864e5));
    $(co).min = next; if ($(co).value <= $(ci).value) $(co).value = next;
  });
}
wireDates('dci', 'dco'); wireDates('ci', 'co');

async function search(s, preferId) {
  if (!s.checkIn || !s.checkOut || s.checkOut <= s.checkIn) throw new Error('Pick a check-out date after your check-in date.');
  let a;
  if (live) a = await api(`/availability?checkIn=${s.checkIn}&checkOut=${s.checkOut}&adults=${s.adults}`);
  else {
    const nights = nightsBetween(s.checkIn, s.checkOut);
    a = { nights, mode:'instant', roomTypes: ROOMS.map((r) => ({ ...r, nights, fits: s.adults <= r.maxAdults, available: 3, totalPerRoom: r.ratePerNight * nights, vat: 0 })) };
  }
  st.search = s; st.avail = a; st.pick = null;
  $('dci').value = s.checkIn; $('dco').value = s.checkOut; $('dad').value = String(s.adults);
  renderOptions(preferId); show('pick'); openDrawer();
}
const fromDrawer = () => ({ checkIn:$('dci').value, checkOut:$('dco').value, adults:+$('dad').value });

/* hero bar (home page) */
if ($('f-search')) $('f-search').addEventListener('submit', async (e) => {
  e.preventDefault(); const btn = $('go'); btn.disabled = true; btn.textContent = 'Checking…';
  try { await search({ checkIn:$('ci').value, checkOut:$('co').value, adults:+$('ad').value }); $('m1').textContent = 'Book direct for the best rate. Pay when you arrive.'; }
  catch (err) { $('m1').innerHTML = ''; const s = document.createElement('span'); s.className = 'err'; s.textContent = err.message; $('m1').appendChild(s); }
  finally { btn.disabled = false; btn.textContent = 'Check rooms'; }
});
$('f-dates').addEventListener('submit', async (e) => {
  e.preventDefault(); msg('m0', ''); const btn = $('dgo'); btn.disabled = true; btn.textContent = 'Checking…';
  try { await search(fromDrawer(), st.prefer); } catch (err) { msg('m0', err.message); }
  finally { btn.disabled = false; btn.textContent = 'See rooms'; }
});
/* any "Book" button: open on the dates step (data-room picks that room after) */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]'); if (!b) return;
  e.preventDefault(); st.prefer = b.dataset.room || null;
  if ($('ci')) { $('dci').value = $('ci').value; $('dco').value = $('co').value; $('dad').value = $('ad').value; }
  const r = ROOMS.find((x) => x.roomTypeId === st.prefer);
  if (r && +$('dad').value > r.maxAdults) $('dad').value = String(r.maxAdults);
  $('sheet').classList.remove('on'); hdr.classList.remove('open');
  show('dates'); openDrawer();
});

function renderOptions(preferId) {
  const { search:s, avail:a } = st;
  $('pick-sub').textContent = `${fmtDay(s.checkIn)} to ${fmtDay(s.checkOut)} · ${a.nights} night${a.nights > 1 ? 's' : ''} · ${s.adults} guest${s.adults > 1 ? 's' : ''}`;
  $('opts').innerHTML = '';
  let lastKind = null;
  a.roomTypes.forEach((r) => {
    const kind = (ROOMS.find((x) => x.roomTypeId === r.roomTypeId) || {}).kind;
    if (kind && kind !== lastKind) { lastKind = kind; $('opts').insertAdjacentHTML('beforeend', `<p class="grp">${kind === 'hotel' ? 'Hotel rooms' : 'Serviced apartments'}</p>`); }
    const ok = r.fits && r.available > 0;
    const d = document.createElement('div');
    d.className = 'opt' + (ok ? '' : ' off'); d.tabIndex = ok ? 0 : -1; d.setAttribute('role', 'radio');
    d.innerHTML = '<b></b><span class="p"></span><small></small><small style="text-align:right"></small>';
    d.children[0].textContent = r.name;
    d.children[1].textContent = naira(r.totalPerRoom);
    d.children[2].textContent = !r.fits ? `Takes up to ${r.maxAdults} guests` : r.available <= 0 ? 'Sold out for these dates' : r.available <= 2 ? `Only ${r.available} left` : `Up to ${r.maxAdults} guests`;
    d.children[3].textContent = `${naira(r.ratePerNight)} / night`;
    const pick = () => { if (!ok) return; st.pick = r; $('opts').querySelectorAll('.opt').forEach((c) => c.classList.remove('sel')); d.classList.add('sel'); $('to-details').disabled = false; };
    d.addEventListener('click', pick); d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    $('opts').appendChild(d);
    if (ok && preferId === r.roomTypeId) pick();
  });
  if (!st.pick) $('to-details').disabled = true;
  msg('m2', a.mode === 'request' ? 'The hotel will call you to confirm shortly after you book.' : '', 'ok');
}

$('to-details').addEventListener('click', () => {
  const { search:s, avail:a, pick:r } = st;
  $('guest-sub').textContent = `${r.name} · ${fmtDay(s.checkIn)} to ${fmtDay(s.checkOut)}`;
  $('sum').innerHTML = `<div><span>${naira(r.ratePerNight)} × ${a.nights} night${a.nights > 1 ? 's' : ''}</span><span>${naira(r.ratePerNight * a.nights)}</span></div>`
    + (r.vat ? `<div><span>VAT</span><span>${naira(r.vat)}</span></div>` : '')
    + `<div class="tot"><span>Total, pay at hotel</span><span>${naira(r.totalPerRoom)}</span></div>`;
  show('guest'); $('gn').focus();
});

$('f-guest').addEventListener('submit', async (e) => {
  e.preventDefault(); msg('m3', '');
  const guest = { name:$('gn').value.trim(), phone:$('gp').value.trim(), email:$('ge').value.trim(), notes:$('gx').value.trim() };
  if (guest.name.length < 2) return msg('m3', 'Enter your full name.');
  if (guest.phone.replace(/\D/g, '').length < 7) return msg('m3', 'Enter a phone number the hotel can reach you on.');
  if (guest.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return msg('m3', 'Check your email address.');
  const btn = $('confirm'); btn.disabled = true; btn.textContent = 'Booking…';
  try {
    const { search:s, pick:r } = st; let b;
    if (live) {
      st.hold = st.hold || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
      const held = await api('/bookings', { method:'POST', headers:{ 'Idempotency-Key':st.hold },
        body: JSON.stringify({ checkIn:s.checkIn, checkOut:s.checkOut, guest, rooms:[{ roomTypeId:r.roomTypeId, quantity:1, adults:s.adults }] }) });
      b = await api(`/bookings/${held.id}/confirm`, { method:'POST', body: JSON.stringify({ payAtHotel:true }) });
    } else {
      b = { status:'confirmed', reservationCode:'RSV-' + Math.random().toString(36).slice(2, 8).toUpperCase(), amount:r.totalPerRoom, demo:true };
    }
    st.hold = null;
    const first = guest.name.split(' ')[0];
    $('done-sub').textContent = ['requested','pending'].includes(b.status)
      ? `Thank you, ${first}. The hotel will call ${guest.phone} to confirm.`
      : `Thank you, ${first}. We look forward to welcoming you.`;
    $('done-code').textContent = b.reservationCode || '';
    $('done-sum').innerHTML = '<div><span></span><span></span></div><div><span></span><span></span></div><div class="tot"><span>Pay at hotel</span><span></span></div>';
    const cells = $('done-sum').querySelectorAll('span');
    cells[0].textContent = r.name; cells[2].textContent = `${fmtDay(s.checkIn)} to ${fmtDay(s.checkOut)}`; cells[5].textContent = naira(b.amount);
    if (b.demo) $('done-sum').insertAdjacentHTML('beforeend', '<p class="note">Sample booking: this site is not connected to the hotel yet.</p>');
    show('done');
  } catch (err) { msg('m3', err.message); }
  finally { btn.disabled = false; btn.textContent = 'Confirm booking'; }
});
document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); show(b.dataset.back); }));

/* ── page parts ── */
if ($('strip')) {
  const words = ['Outdoor pool','Poolside bar','Full kitchens','Gated estate','Free parking','Fast Wi-Fi','Restaurant','Meeting space'];
  $('strip').innerHTML = [...words, ...words].map((w) => `<span>${w}</span>`).join('');
}
/* home: hotel vs apartments, side by side */
const from = (k) => Math.min(...ROOMS.filter((r) => r.kind === k).map((r) => r.ratePerNight));
document.querySelectorAll('[data-from]').forEach((el) => el.textContent = naira(from(el.dataset.from)));
/* compare table: every room on one scale */
if ($('compare')) {
  const maxSqm = Math.max(...ROOMS.map((r) => r.sqm));
  $('compare').innerHTML = `<table><thead><tr><th>Stay</th><th>Type</th><th>Size</th><th class="n">Bedrooms</th><th class="n">Guests</th><th>Kitchen</th><th class="n">From / night</th><th></th></tr></thead><tbody>${ROOMS.map((r) => `
    <tr class="${r.kind}"><td><a href="rooms.html#${r.roomTypeId}">${r.name}</a></td><td><span class="pill ${r.kind}">${KIND[r.kind]}</span></td>
    <td><div class="meter"><i style="width:${Math.round(r.sqm / maxSqm * 100)}%"></i></div><small>${r.sqm} m²</small></td>
    <td class="n">${r.bedrooms}</td><td class="n">${r.maxAdults}</td><td>${r.kind === 'apartment' ? 'Yes' : 'No'}</td>
    <td class="n">${naira(r.ratePerNight)}</td><td><button class="btn line sm" data-open data-room="${r.roomTypeId}">Book</button></td></tr>`).join('')}</tbody></table>`;
}
/* rooms page */
['hotel','apartment'].forEach((kind) => {
  const box = $(kind === 'hotel' ? 'hotel-rooms' : 'apartments-list'); if (!box) return;
  ROOMS.filter((r) => r.kind === kind).forEach((r, i) => {
    const el = document.createElement('article'); el.className = 'rd' + (i % 2 ? ' flip' : ''); el.id = r.roomTypeId;
    el.innerHTML = `<div class="rd-img"><img src="${r.img}" alt="" loading="lazy"><span class="pill ${kind} on-img">${KIND[kind]}</span></div>
      <div class="rd-txt"><span class="kicker"></span><h2></h2><p></p>
        <dl class="specs"><div><dt>Size</dt><dd>${r.sqm} m²</dd></div><div><dt>Bedrooms</dt><dd>${r.bedrooms}</dd></div><div><dt>Bathrooms</dt><dd>${r.baths}</dd></div><div><dt>Guests</dt><dd>Up to ${r.maxAdults}</dd></div></dl>
        <ul class="has"></ul>
        <div class="rd-buy"><div><small>FROM</small><b>${naira(r.ratePerNight)}</b><small>PER NIGHT</small></div><button class="btn" data-open data-room="${r.roomTypeId}">Book this</button></div></div>`;
    el.querySelector('.kicker').textContent = r.bed;
    el.querySelector('h2').textContent = r.name;
    el.querySelector('.rd-txt p').textContent = r.about;
    el.querySelector('img').alt = r.name;
    r.has.forEach((t) => { const li = document.createElement('li'); li.textContent = t; el.querySelector('.has').appendChild(li); });
    box.appendChild(el);
  });
});

/* gallery lightbox */
document.querySelectorAll('[data-zoom]').forEach((f) => f.addEventListener('click', () => {
  const box = document.createElement('div'); box.className = 'lb'; box.tabIndex = -1;
  box.innerHTML = `<img alt=""><button class="x" aria-label="Close">×</button>`;
  box.querySelector('img').src = f.querySelector('img').src; box.querySelector('img').alt = f.querySelector('img').alt;
  const shut = () => box.remove();
  box.onclick = shut; addEventListener('keydown', function k(e) { if (e.key === 'Escape') { shut(); removeEventListener('keydown', k); } });
  document.body.appendChild(box); box.focus();
}));

/* contact form: no inbox yet, so it shows the message to send by phone/WhatsApp */
if ($('f-contact')) $('f-contact').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('cn').value.trim(), text = $('cm').value.trim();
  if (name.length < 2 || text.length < 3) return msg('m-contact', 'Add your name and a short message.');
  msg('m-contact', 'Sample form: messages are not sent yet. Call or WhatsApp the front desk for now.', 'ok');
  e.target.reset();
});
