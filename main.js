/* BlueHarbor — site. Sem dependências. */
(() => {
  'use strict';

  // Contato dos parceiros. Preencha e os botões "Quero ser prestador" etc. abrem o canal certo.
  const CONTACT = {
    email: 'luciano@blueharbor-ai.app',
    whatsapp: '',   // só números com DDI, ex.: '5512999999999'
  };

  const APK_URL = 'https://github.com/lucianomathias1982/blueharbor-site/releases/latest/download/BlueHarbor-android.apk';
  const APP_URL = 'app/';
  const SPOT = { lat: -23.7785, lng: -45.3615 }; // canal de São Sebastião, em frente à vila de Ilhabela
  const TZ = 'America/Sao_Paulo';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Menu ---------- */
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Plataforma: o botão principal é o que serve para este aparelho ---------- */
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const os = /Android/i.test(ua) ? 'android' : isIOS ? 'ios' : 'web';

  const icon = {
    download: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14"/></svg>',
    screen: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/></svg>',
    phone: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
  };
  const setCta = (el, href, ico, label) => { el.href = href; el.innerHTML = `${ico}<span>${label}</span>`; };
  const primary = $('[data-cta="primary"]');
  const secondary = $('[data-cta="secondary"]');
  if (os === 'android') {
    setCta(primary, APK_URL, icon.download, 'Baixar para Android');
    setCta(secondary, APP_URL, icon.screen, 'Abrir no navegador');
  } else if (os === 'ios') {
    setCta(primary, APP_URL, icon.screen, 'Abrir no iPhone');
    setCta(secondary, '#baixar', icon.phone, 'Instalar no iPhone');
  } else {
    setCta(primary, APP_URL, icon.screen, 'Abrir a plataforma');
    setCta(secondary, '#baixar', icon.phone, 'Baixar para o celular');
  }
  const mine = $(`.getcard[data-os="${os}"]`);
  if (mine) {
    mine.classList.add('is-mine');
    mine.insertAdjacentHTML('afterbegin', '<span class="mine-label">Para o seu aparelho</span>');
    // No celular, o cartão do próprio aparelho vem primeiro.
    if (os !== 'web') mine.parentElement.prepend(mine);
  }

  /* ---------- Contato ---------- */
  const contactHref = (topic) => {
    const msg = {
      prestador: 'Olá! Quero ser prestador no BlueHarbor em Ilhabela.',
      poita: 'Olá! Quero cadastrar minha poita no BlueHarbor.',
      beta: 'Olá! Quero entrar no beta do BlueHarbor para iPhone.',
      geral: 'Olá! Quero saber mais sobre o BlueHarbor.',
    }[topic] || 'Olá! Quero saber mais sobre o BlueHarbor.';
    if (CONTACT.whatsapp) return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`;
    if (CONTACT.email) return `mailto:${CONTACT.email}?subject=${encodeURIComponent('BlueHarbor')}&body=${encodeURIComponent(msg)}`;
    return null;
  };
  if (contactHref('geral')) {
    $$('[data-contact]').forEach((a) => {
      a.href = contactHref(a.dataset.contact);
      if (a.href.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener'; }
    });
    const label = CONTACT.whatsapp ? 'Chamar no WhatsApp' : 'Mandar um e-mail';
    $('[data-contact-actions]').insertAdjacentHTML('afterbegin',
      `<a class="btn btn--teal btn--lg" href="${contactHref('geral')}"${CONTACT.whatsapp ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`);
  }

  /* ---------- Posso sair hoje? (mesmas regras de packages/core/src/sea.ts) ---------- */
  const goCard = $('[data-go]');
  let hours = null;

  const nowKeySP = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:00`;
  };

  const fetchJson = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  };

  async function loadSea() {
    const common = { latitude: SPOT.lat, longitude: SPOT.lng, timezone: TZ, forecast_days: 2 };
    const qs = (o) => new URLSearchParams(o).toString();
    const [w, m] = await Promise.all([
      fetchJson(`https://api.open-meteo.com/v1/forecast?${qs({ ...common, hourly: 'wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,visibility', wind_speed_unit: 'kn' })}`),
      fetchJson(`https://marine-api.open-meteo.com/v1/marine?${qs({ ...common, hourly: 'wave_height,wave_period,sea_surface_temperature' })}`).catch(() => ({})),
    ]);
    const mi = new Map((m.hourly?.time ?? []).map((t, i) => [t, i]));
    const num = (v) => (typeof v === 'number' ? v : null);
    const all = w.hourly.time.map((time, i) => {
      const j = mi.get(time);
      const mc = (k) => (j === undefined ? null : num(m.hourly[k]?.[j]));
      return {
        time,
        wind: num(w.hourly.wind_speed_10m[i]),
        gust: num(w.hourly.wind_gusts_10m[i]),
        dir: num(w.hourly.wind_direction_10m[i]),
        pressure: num(w.hourly.pressure_msl[i]),
        vis: num(w.hourly.visibility[i]),
        wave: mc('wave_height'),
        period: mc('wave_period'),
        water: mc('sea_surface_temperature'),
      };
    });
    const start = Math.max(0, all.findIndex((h) => h.time >= nowKeySP()));
    return all.slice(start, start + 12);
  }

  function assess(hs, feet) {
    const s = Math.min(1.6, Math.max(0.7, feet / 28));
    const L = { windY: 15 * s, windR: 22 * s, gustR: 28 * s, waveY: 1.2 * s, waveR: 2.0 * s, visR: 1000 };
    let level = 'verde';
    const raise = (to) => { if (to === 'vermelho' || (to === 'amarelo' && level === 'verde')) level = to; };
    const reasons = [];
    const max = (k) => Math.max(0, ...hs.map((h) => h[k] ?? 0));
    const maxWind = max('wind'), maxGust = max('gust'), maxWave = max('wave');
    const vis = hs.map((h) => h.vis).filter((v) => v !== null);
    const minVis = vis.length ? Math.min(...vis) : Infinity;
    if (maxWind >= L.windY) { raise(maxWind >= L.windR ? 'vermelho' : 'amarelo'); reasons.push(`Vento de até ${Math.round(maxWind)} nós`); }
    if (maxGust >= L.gustR) { raise('vermelho'); reasons.push(`Rajadas de até ${Math.round(maxGust)} nós`); }
    if (maxWave >= L.waveY) { raise(maxWave >= L.waveR ? 'vermelho' : 'amarelo'); reasons.push(`Ondas de até ${maxWave.toFixed(1).replace('.', ',')} m`); }
    if (minVis < L.visR) { raise('vermelho'); reasons.push(`Visibilidade de ${Math.round(minVis)} m`); }
    const p = hs.map((h) => h.pressure).filter((v) => v !== null);
    let drop = 0;
    for (let i = 3; i < p.length; i++) drop = Math.max(drop, p[i - 3] - p[i]);
    if (p.length >= 4 && drop >= 4) { raise('amarelo'); reasons.push(`Pressão caindo ${drop.toFixed(0)} hPa: o tempo pode virar`); }
    const headline = { verde: 'Condições boas para sair.', amarelo: 'Dá para sair com atenção.', vermelho: 'Não recomendado sair agora.' }[level];
    return { level, headline, reasons, L, maxWind, maxGust, maxWave };
  }

  const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const compass = (d) => COMPASS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16];
  const fmt1 = (n) => n.toFixed(1).replace('.', ',');

  function render() {
    if (!hours || !hours.length) return;
    const feet = Number($('input[name="boat"]:checked').value);
    const a = assess(hours, feet);
    const now = hours[0];
    goCard.dataset.level = a.level;
    goCard.setAttribute('aria-busy', 'false');
    $('[data-go-badge]').textContent = { verde: 'Bom para sair', amarelo: 'Atenção', vermelho: 'Fique no porto' }[a.level];
    $('[data-go-title]').textContent = a.headline;
    $('[data-go-reasons]').innerHTML = (a.reasons.length ? a.reasons : ['Vento e mar dentro dos limites para o seu barco'])
      .map((r) => `<li>${r}</li>`).join('');

    const stat = (k, html) => { $(`[data-stat="${k}"]`).innerHTML = html; };
    stat('wind', now.wind === null ? '—' : `${Math.round(now.wind)} nós${now.dir === null ? '' : ` <small>${compass(now.dir)}</small>`}`);
    stat('gust', now.gust === null ? '—' : `${Math.round(now.gust)} nós <small>até ${Math.round(a.maxGust)}</small>`);
    stat('wave', now.wave === null ? '—' : `${fmt1(now.wave)} m${now.period ? ` <small>${Math.round(now.period)} s</small>` : ''}`);
    stat('water', now.water === null ? '—' : `${Math.round(now.water)} °C`);

    const top = Math.max(a.L.waveR * 1.15, a.maxWave, 0.5);
    $('[data-go-chart]').innerHTML = hours.map((h) => {
      const v = h.wave ?? 0;
      const cls = v >= a.L.waveR ? 'is-red' : v >= a.L.waveY ? 'is-yellow' : '';
      return `<div class="bar" title="${h.time.slice(11)} · ondas ${fmt1(v)} m"><span class="bar__fill ${cls}" style="height:${Math.max(4, (v / top) * 100)}%"></span><small>${h.time.slice(11, 13)}h</small></div>`;
    }).join('');

    const dot = $('[data-go-dot]');
    dot.className = `dot dot--${a.level}`;
    $('[data-go-chip-text]').textContent = a.headline.replace(/\.$/, '');
    $('[data-go-updated]').textContent = `Ondas por hora · Open-Meteo, atualizado às ${new Date().toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })}`;
  }

  function seaError() {
    goCard.setAttribute('aria-busy', 'false');
    $('[data-go-badge]').textContent = 'Sem conexão';
    $('[data-go-title]').textContent = 'Não consegui buscar a previsão agora.';
    $('[data-go-reasons]').innerHTML = '<li>Tente de novo em instantes ou veja no app</li>';
    $('[data-go-dot]').className = 'dot';
    $('[data-go-chip-text]').textContent = 'Veja a previsão no app';
  }

  $$('input[name="boat"]').forEach((r) => r.addEventListener('change', render));
  loadSea().then((h) => { hours = h; render(); }).catch(seaError);

  /* ---------- Menu sólido ao rolar e link da seção atual ---------- */
  const nav = $('.nav');
  const links = $$('.nav__links a');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    nav.classList.toggle('is-solid', scrollY > 40);
    const y = innerHeight * 0.4;
    const active = sections.filter((s) => s.getBoundingClientRect().top <= y).pop();
    links.forEach((l) => l.setAttribute('aria-current', String(!!active && l.getAttribute('href') === `#${active.id}`)));
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Vídeos de fundo: só tocam se a pessoa não pediu menos movimento nem economia de dados ---------- */
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;
  const videos = $$('video.bgvideo');
  if (!calm) {
    const small = matchMedia('(max-width: 760px)').matches;
    const start = (v) => {
      if (!v.src) { v.src = small ? v.dataset.srcSm : v.dataset.srcLg; v.load(); }
      v.play().catch(() => {}); // sem autoplay, fica a imagem de capa
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? start(e.target) : e.target.pause()));
      }, { rootMargin: '200px 0px' });
      videos.forEach((v) => io.observe(v));
    } else {
      videos.forEach(start);
    }
  }

  $('[data-year]').textContent = new Date().getFullYear();
})();
