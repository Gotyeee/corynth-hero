/* ============================================================
   CORYNTH LABS — Cart drawer
   Slide-out cart with bulk-tier discount logic, FIRST10 promo,
   and crypto/card rail toggle. State persists in localStorage.

   Integration hooks:
   - data-pay-rail="crypto|card"  → swap actual processor here
   - data-cart-add                → buttons that add to cart
   - data-cart-open               → buttons that open the drawer
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY  = 'corynth.cart.v1';
  var RAIL_KEY     = 'corynth.cart.rail';
  var PROMO_KEY    = 'corynth.cart.promo';
  var FREE_SHIP_AT = 200;

  /* Backend: payment-create endpoint on the Cloudflare Worker.
     Set window.CORYNTH_PAY_ENDPOINT in HTML to override (e.g. for staging). */
  var PAY_ENDPOINT = (window.CORYNTH_PAY_ENDPOINT ||
    'https://corynth-webhooks.inherentbirdq.workers.dev') + '/create-invoice';

  /* Bulk tiers — crypto only. Threshold met by EITHER subtotal OR item count. */
  var TIERS = [
    { pct: 0.25, minSubtotal: 800, minItems: Infinity, label: '25% off' },
    { pct: 0.18, minSubtotal: 400, minItems: Infinity, label: '18% off' },
    { pct: 0.10, minSubtotal: 150, minItems: 3,        label: '10% off' }
  ];
  var PROMO = { code: 'FIRST10', pct: 0.10 };

  /* ---------- state ---------- */
  var state = {
    items: load(STORAGE_KEY, []),
    rail:  load(RAIL_KEY, 'crypto'),
    promo: load(PROMO_KEY, '')
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      localStorage.setItem(RAIL_KEY,    JSON.stringify(state.rail));
      localStorage.setItem(PROMO_KEY,   JSON.stringify(state.promo));
    } catch (e) {}
  }

  /* ---------- math ---------- */
  function subtotal() {
    return state.items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }
  function itemCount() {
    return state.items.reduce(function (s, i) { return s + i.qty; }, 0);
  }
  function bulkTier(sub, count) {
    for (var i = 0; i < TIERS.length; i++) {
      var t = TIERS[i];
      if (sub >= t.minSubtotal || count >= t.minItems) return t;
    }
    return null;
  }
  function activeDiscount(sub, count) {
    /* No stacking — take whichever is largest. Crypto-only. */
    if (state.rail !== 'crypto') return { pct: 0, source: null };
    var tier = bulkTier(sub, count);
    var bulkPct  = tier ? tier.pct : 0;
    var promoPct = state.promo === PROMO.code ? PROMO.pct : 0;
    if (bulkPct === 0 && promoPct === 0) return { pct: 0, source: null };
    if (bulkPct >= promoPct) return { pct: bulkPct, source: 'bulk', tier: tier };
    return { pct: promoPct, source: 'promo' };
  }
  function fmt(n) { return '$' + n.toFixed(2); }

  /* Next-tier nudge: smallest gap (subtotal $ or vial count) to next tier above current. */
  function nextTierHint(sub, count) {
    var current = bulkTier(sub, count);
    var currentPct = current ? current.pct : 0;
    /* TIERS is ordered high→low; find highest tier above current */
    var nextUp = null;
    for (var i = TIERS.length - 1; i >= 0; i--) {
      if (TIERS[i].pct > currentPct) { nextUp = TIERS[i]; break; }
    }
    if (!nextUp) return '';
    var dollarsAway = nextUp.minSubtotal - sub;
    var vialsAway   = nextUp.minItems   - count;
    if (dollarsAway <= 0 || vialsAway <= 0) return '';
    /* Prefer the closer path (fewer vials usually means a smaller ask). */
    if (isFinite(vialsAway) && vialsAway > 0 && vialsAway <= 5 && vialsAway < dollarsAway / 30) {
      return 'Add ' + vialsAway + ' more vial' + (vialsAway === 1 ? '' : 's') +
             ' to unlock ' + Math.round(nextUp.pct * 100) + '% off.';
    }
    return 'Spend ' + fmt(dollarsAway) + ' more to unlock ' +
           Math.round(nextUp.pct * 100) + '% off.';
  }

  /* ---------- mutations ---------- */
  function addItem(item) {
    var existing = null;
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === item.id) { existing = state.items[i]; break; }
    }
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      state.items.push({
        id:    item.id,
        name:  item.name,
        code:  item.code  || '',
        dose:  item.dose  || '',
        price: Number(item.price) || 0,
        qty:   item.qty   || 1,
        image: item.image || ''
      });
    }
    save();
    render();
    showAddedToast();
  }

  /* ---------- "Added" toast ---------- */
  var toastTimer = null;
  function showAddedToast() {
    var $toast = document.getElementById('cartToast');
    if (!$toast) return;
    $toast.hidden = false;
    /* force reflow so the transition fires reliably on rapid re-trigger */
    void $toast.offsetWidth;
    $toast.classList.add('cart-toast--on');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      $toast.classList.remove('cart-toast--on');
      setTimeout(function () { $toast.hidden = true; }, 200);
    }, 1800);
  }
  function setQty(id, qty) {
    qty = Math.max(0, Math.floor(qty));
    var idx = -1;
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) { idx = i; break; }
    }
    if (idx < 0) return;
    if (qty === 0) state.items.splice(idx, 1);
    else state.items[idx].qty = qty;
    save();
    render();
  }
  function removeItem(id) { setQty(id, 0); }
  function setRail(rail) {
    if (rail !== 'crypto' && rail !== 'card') return;
    state.rail = rail;
    save();
    render();
  }
  function applyPromo(code) {
    var c = (code || '').trim().toUpperCase();
    state.promo = c === PROMO.code ? PROMO.code : '';
    save();
    render();
    return state.promo === PROMO.code;
  }

  /* ---------- DOM refs ---------- */
  var $drawer, $backdrop, $list, $count, $subtotalEl, $discountRow,
      $discountLabel, $discountAmt, $totalEl, $checkoutBtn,
      $emptyState, $promoInput, $promoApply, $promoMsg,
      $rewardMsg, $headerCounts;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- render ---------- */
  function render() {
    if (!$drawer) return;
    var sub   = subtotal();
    var count = itemCount();
    var disc  = activeDiscount(sub, count);
    var discAmt = sub * disc.pct;
    var total = sub - discAmt;

    /* header counts (every cart icon) */
    $headerCounts.forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });

    $count.textContent = count === 1 ? '1 item' : count + ' items';

    /* items — render whenever the set of ids changes; otherwise just update qty/price in place */
    var ids = state.items.map(function (i) { return i.id; }).join('|');
    if (state.items.length === 0) {
      $list.innerHTML = '';
      $list.hidden = true;
      $emptyState.hidden = false;
      $list.dataset.ids = '';
    } else {
      $list.hidden = false;
      $emptyState.hidden = true;
      if ($list.dataset.ids !== ids) {
        $list.innerHTML = state.items.map(itemHTML).join('');
        $list.dataset.ids = ids;
      } else {
        /* In-place update: avoids destroying the button you're clicking. */
        state.items.forEach(function (it) {
          var li = $list.querySelector('.cart-item[data-id="' + cssEsc(it.id) + '"]');
          if (!li) return;
          var qtyEl = li.querySelector('.cart-qty__val');
          var priceEl = li.querySelector('.cart-item__price');
          if (qtyEl) qtyEl.textContent = it.qty;
          if (priceEl) priceEl.textContent = fmt(it.price * it.qty);
        });
      }
    }

    /* rail buttons */
    $$('.cart-rail', $drawer).forEach(function (btn) {
      var on = btn.getAttribute('data-pay-rail') === state.rail;
      btn.classList.toggle('cart-rail--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    /* discount row */
    if (disc.pct > 0) {
      $discountRow.hidden = false;
      var labelTxt = disc.source === 'promo'
        ? 'Promo · FIRST10'
        : 'Bulk & Save · ' + (disc.tier ? disc.tier.label : '');
      $discountLabel.textContent = labelTxt;
      $discountAmt.textContent = '−' + fmt(discAmt);
    } else {
      $discountRow.hidden = true;
    }

    /* Reward / progress nudge */
    var rewardTxt = '';
    var rewardKind = '';
    if (count > 0) {
      if (state.rail === 'card') {
        /* On card — would qualify on crypto */
        var t = bulkTier(sub, count);
        var p = state.promo === PROMO.code ? PROMO.pct : 0;
        var maxPct = Math.max(t ? t.pct : 0, p);
        if (maxPct > 0) {
          rewardTxt = 'Save ' + Math.round(maxPct * 100) + '% on this order with crypto.';
          rewardKind = 'switch';
        }
      } else {
        /* On crypto — show current tier or next-tier nudge */
        var nextHint = nextTierHint(sub, count);
        if (disc.source === 'bulk' && disc.tier) {
          if (nextHint) {
            rewardTxt = disc.tier.label + ' applied · ' + nextHint;
          } else {
            rewardTxt = disc.tier.label + ' applied — max bulk tier reached.';
          }
          rewardKind = 'on';
        } else if (disc.source === 'promo') {
          rewardTxt = 'FIRST10 applied (10% off).';
          rewardKind = 'on';
        } else if (nextHint) {
          rewardTxt = nextHint;
          rewardKind = 'progress';
        }
      }
    }
    if (rewardTxt) {
      $rewardMsg.hidden = false;
      $rewardMsg.textContent = rewardTxt;
      $rewardMsg.dataset.kind = rewardKind;
    } else {
      $rewardMsg.hidden = true;
      delete $rewardMsg.dataset.kind;
    }

    /* subtotal / total */
    $subtotalEl.textContent = fmt(sub);
    $totalEl.textContent = fmt(total);

    /* promo */
    if (state.promo === PROMO.code) {
      $promoInput.value = PROMO.code;
      $promoMsg.hidden = false;
      $promoMsg.textContent = state.rail === 'crypto'
        ? 'FIRST10 applied.'
        : 'FIRST10 ready — switch to crypto to redeem.';
      $promoMsg.classList.toggle('cart-promo__msg--ok', state.rail === 'crypto');
    } else if ($promoInput.value && $promoInput.dataset.touched === '1') {
      $promoMsg.hidden = false;
      $promoMsg.textContent = 'Code not recognized.';
      $promoMsg.classList.remove('cart-promo__msg--ok');
    } else {
      $promoMsg.hidden = true;
    }

    /* checkout */
    $checkoutBtn.disabled = count === 0;

    /* Broadcast — PDP listens to highlight bulk-tier rows */
    document.dispatchEvent(new CustomEvent('cart:render', {
      detail: {
        items: state.items.slice(),
        subtotal: sub,
        count: count,
        rail: state.rail,
        discountPct: disc.pct,
        discountSource: disc.source
      }
    }));
  }

  function itemHTML(it) {
    var img = it.image
      ? '<img src="' + escAttr(it.image) + '" alt="">'
      : '<span class="cart-item__code">' + esc(it.code || it.name) + '</span>';
    var dose = it.dose ? '<span class="cart-item__dose">' + esc(it.dose) + '</span>' : '';
    return '' +
      '<li class="cart-item" data-id="' + escAttr(it.id) + '">' +
        '<div class="cart-item__thumb">' + img + '</div>' +
        '<div class="cart-item__body">' +
          '<div class="cart-item__top">' +
            '<div class="cart-item__name">' + esc(it.name) + dose + '</div>' +
            '<button class="cart-item__remove" data-act="remove" aria-label="Remove">×</button>' +
          '</div>' +
          '<div class="cart-item__bot">' +
            '<div class="cart-qty" role="group" aria-label="Quantity">' +
              '<button class="cart-qty__btn" data-act="dec" aria-label="Decrease">−</button>' +
              '<span class="cart-qty__val">' + it.qty + '</span>' +
              '<button class="cart-qty__btn" data-act="inc" aria-label="Increase">+</button>' +
            '</div>' +
            '<span class="cart-item__price">' + fmt(it.price * it.qty) + '</span>' +
          '</div>' +
        '</div>' +
      '</li>';
  }

  /* Delegated handler — survives in-place renders, immune to spam-click DOM swaps. */
  function bindListDelegation() {
    $list.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('button[data-act]');
      if (!btn || !$list.contains(btn)) return;
      var li = btn.closest('.cart-item');
      if (!li) return;
      var id = li.getAttribute('data-id');
      var item = null;
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) { item = state.items[i]; break; }
      }
      if (!item) return;
      var act = btn.getAttribute('data-act');
      if (act === 'inc') setQty(id, item.qty + 1);
      else if (act === 'dec') setQty(id, item.qty - 1);
      else if (act === 'remove') removeItem(id);
    });
  }

  /* CSS.escape polyfill for older browsers */
  function cssEsc(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, function (c) {
      return '\\' + c.charCodeAt(0).toString(16) + ' ';
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, '&quot;');
  }

  /* ---------- open / close ---------- */
  var lastFocus = null;
  function pauseHeroVideo() {
    var v = document.querySelector('.hero__media');
    if (v && typeof v.pause === 'function') { try { v.pause(); } catch (e) {} }
  }
  function resumeHeroVideo() {
    var v = document.querySelector('.hero__media');
    if (v && typeof v.play === 'function') { try { v.play(); } catch (e) {} }
  }
  function open() {
    if (!$drawer) return;
    lastFocus = document.activeElement;
    $drawer.classList.add('cart-drawer--open');
    $backdrop.classList.add('cart-backdrop--on');
    $drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-locked');
    pauseHeroVideo();
    setTimeout(function () {
      var first = $('.cart-drawer__close', $drawer);
      if (first) first.focus();
    }, 60);
  }
  function close() {
    if (!$drawer) return;
    $drawer.classList.remove('cart-drawer--open');
    $backdrop.classList.remove('cart-backdrop--on');
    $drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-locked');
    resumeHeroVideo();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- wire ---------- */
  function wireOnce() {
    $drawer        = $('#cartDrawer');
    $backdrop      = $('#cartBackdrop');
    if (!$drawer || !$backdrop) return;
    $list          = $('#cartList',         $drawer);
    $count         = $('#cartCount',        $drawer);
    $subtotalEl    = $('#cartSubtotal',     $drawer);
    $discountRow   = $('#cartDiscountRow',  $drawer);
    $discountLabel = $('#cartDiscountLabel',$drawer);
    $discountAmt   = $('#cartDiscountAmt',  $drawer);
    $totalEl       = $('#cartTotal',        $drawer);
    $checkoutBtn   = $('#cartCheckout',     $drawer);
    $emptyState    = $('#cartEmpty',        $drawer);
    $promoInput    = $('#cartPromoInput',   $drawer);
    $promoApply    = $('#cartPromoApply',   $drawer);
    $promoMsg      = $('#cartPromoMsg',     $drawer);
    $rewardMsg     = $('#cartReward',       $drawer);
    $headerCounts  = $$('.icon-btn__count');

    /* delegated qty/remove handler — bound once, survives renders */
    bindListDelegation();

    /* close handlers */
    $('.cart-drawer__close', $drawer).addEventListener('click', close);
    $backdrop.addEventListener('click', close);
    var $continue = $('[data-cart-continue]', $drawer);
    if ($continue) $continue.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $drawer.classList.contains('cart-drawer--open')) close();
    });

    /* rail toggle */
    $$('.cart-rail', $drawer).forEach(function (btn) {
      btn.addEventListener('click', function () {
        setRail(btn.getAttribute('data-pay-rail'));
      });
    });

    /* promo */
    function tryApply() {
      $promoInput.dataset.touched = '1';
      applyPromo($promoInput.value);
    }
    $promoApply.addEventListener('click', tryApply);
    $promoInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); tryApply(); }
    });
    $promoInput.addEventListener('input', function () {
      if (state.promo && $promoInput.value.trim().toUpperCase() !== PROMO.code) {
        state.promo = '';
        save();
        render();
      }
    });

    /* checkout — opens the email/shipping modal, then hands off to Plisio. */
    $checkoutBtn.addEventListener('click', function () {
      if (state.items.length === 0) return;
      if (state.rail === 'card') {
        window.alert(
          'Card checkout is not live yet.\n' +
          'Switch to crypto for the launch discount, or check back in a few weeks.'
        );
        return;
      }
      openCheckoutModal();
    });

    /* open buttons — any element with [data-cart-open] or .icon-btn[aria-label="Cart"] */
    $$('[data-cart-open], .icon-btn[aria-label="Cart"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });

    /* add buttons — [data-cart-add] reads data-* attributes */
    $$('[data-cart-add]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = readAddTarget(btn);
        if (item) { addItem(item); open(); }
      });
    });

    /* Card click → product page (ignore clicks on the Add button) */
    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('[data-href]');
      if (!card) return;
      if (e.target.closest('[data-cart-add]')) return;
      window.location.href = card.getAttribute('data-href');
    });
    /* Keyboard activation for cards */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest && e.target.closest('[data-href]');
      if (!card || card !== e.target) return;
      e.preventDefault();
      window.location.href = card.getAttribute('data-href');
    });
  }

  /* For PDP: button is wired via data-cart-add but reads price/dose
     from the active dose option so the dose selector "just works". */
  function readAddTarget(btn) {
    if (btn.hasAttribute('data-cart-pdp')) {
      var info = readPdpActive();
      if (!info) return null;
      var qtyInput = document.querySelector('.pdp-qty__input');
      var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
      return {
        id:    info.id,
        name:  info.name,
        code:  info.code,
        dose:  info.dose,
        price: info.price,
        qty:   qty,
        image: info.image
      };
    }
    return {
      id:    btn.getAttribute('data-id') || btn.getAttribute('data-name'),
      name:  btn.getAttribute('data-name') || '',
      code:  btn.getAttribute('data-code') || '',
      dose:  btn.getAttribute('data-dose') || '',
      price: parseFloat(btn.getAttribute('data-price')) || 0,
      qty:   parseInt(btn.getAttribute('data-qty'), 10) || 1,
      image: btn.getAttribute('data-image') || ''
    };
  }

  function readPdpActive() {
    var title = document.querySelector('.pdp-info__title');
    var eyebrow = document.querySelector('.pdp-info__eyebrow');
    var img = document.querySelector('.pdp-media__stage img');
    var active = document.querySelector('.pdp-option--active');
    if (!title || !active) return null;
    var dose = active.querySelector('.pdp-option__name');
    var priceEl = active.querySelector('.pdp-option__price');
    var price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0;
    var doseTxt = dose ? dose.textContent.trim() : '';
    var name = (eyebrow ? eyebrow.textContent.trim() : title.textContent.trim());
    return {
      id:   (name + ' ' + doseTxt).toLowerCase().replace(/\s+/g, '-'),
      name: name,
      code: title.textContent.trim() + (doseTxt ? ' · ' + doseTxt.toUpperCase() : ''),
      dose: doseTxt,
      price: price,
      image: img ? img.getAttribute('src') : ''
    };
  }

  /* CTA price = active dose unit price × current qty */
  function updatePdpCtaPrice() {
    var input = document.querySelector('.pdp-qty__input');
    var active = document.querySelector('.pdp-option--active') ||
                 document.querySelector('.pdp-option');
    var cta = document.querySelector('.pdp-cta--primary .pdp-cta__price');
    if (!cta || !active) return;
    var qty = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;
    var priceEl = active.querySelector('.pdp-option__price');
    var unit = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
    cta.textContent = '$' + (unit * qty).toFixed(2);
  }

  /* PDP dose selector — reflect price into Add to Cart label */
  function wirePdpOptions() {
    var opts = $$('.pdp-option');
    if (opts.length === 0) return;
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        opts.forEach(function (o) { o.classList.remove('pdp-option--active'); });
        opt.classList.add('pdp-option--active');
        updatePdpCtaPrice();
      });
    });
  }

  /* PDP qty buttons + direct typing */
  function wirePdpQty() {
    var input = document.querySelector('.pdp-qty__input');
    if (!input) return;
    var btns = $$('.pdp-qty__btn');
    if (btns.length >= 2) {
      btns[0].addEventListener('click', function () {
        var v = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        input.value = v;
        updatePdpCtaPrice();
      });
      btns[1].addEventListener('click', function () {
        var v = Math.max(1, (parseInt(input.value, 10) || 1) + 1);
        input.value = v;
        updatePdpCtaPrice();
      });
    }
    input.addEventListener('input', function () {
      var v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) return; /* don't clobber while typing */
      updatePdpCtaPrice();
    });
    input.addEventListener('blur', function () {
      var v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) input.value = 1;
      updatePdpCtaPrice();
    });
  }

  /* Public so product-data.js can refresh after a variant swap */
  window.CorynthPdp = { refreshCtaPrice: updatePdpCtaPrice };

  /* Expose for product cards on index — clicking a card adds the item. */
  window.CorynthCart = {
    add:    addItem,
    open:   open,
    close:  close,
    setRail: setRail,
    state:  state
  };

  /* ---------- checkout modal (email + shipping → Plisio invoice) ---------- */
  var $coModal, $coBackdrop, $coForm, $coEmail, $coShip, $coSubmit, $coError, $coSummary;

  function ensureCheckoutModal() {
    if ($coModal) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="co-backdrop" id="coBackdrop" hidden></div>' +
      '<div class="co-modal" id="coModal" role="dialog" aria-modal="true" aria-labelledby="coTitle" hidden>' +
        '<div class="co-modal__card">' +
          '<button type="button" class="co-modal__close" aria-label="Close">×</button>' +
          '<h2 id="coTitle" class="co-modal__title">Checkout</h2>' +
          '<p class="co-modal__sub">Pay with crypto via Plisio. We email a batch-matched COA after payment confirms.</p>' +
          '<dl class="co-modal__summary" id="coSummary"></dl>' +
          '<form class="co-modal__form" id="coForm" novalidate>' +
            '<label class="co-field">' +
              '<span class="co-field__label">Email</span>' +
              '<input id="coEmail" type="email" required autocomplete="email" inputmode="email" placeholder="you@example.com">' +
            '</label>' +
            '<label class="co-field">' +
              '<span class="co-field__label">Shipping address</span>' +
              '<textarea id="coShip" required rows="4" autocomplete="shipping street-address" placeholder="Full name\nStreet address\nCity, State ZIP\nCountry"></textarea>' +
            '</label>' +
            '<p class="co-modal__error" id="coError" hidden></p>' +
            '<button type="submit" class="co-modal__submit" id="coSubmit">Continue to crypto checkout →</button>' +
            '<p class="co-modal__legal">For research use only. Not for human or veterinary use. By continuing you confirm you are a qualified researcher.</p>' +
          '</form>' +
        '</div>' +
      '</div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    $coBackdrop = document.getElementById('coBackdrop');
    $coModal    = document.getElementById('coModal');
    $coForm     = document.getElementById('coForm');
    $coEmail    = document.getElementById('coEmail');
    $coShip     = document.getElementById('coShip');
    $coSubmit   = document.getElementById('coSubmit');
    $coError    = document.getElementById('coError');
    $coSummary  = document.getElementById('coSummary');

    $coBackdrop.addEventListener('click', closeCheckoutModal);
    $coModal.querySelector('.co-modal__close').addEventListener('click', closeCheckoutModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$coModal.hidden) closeCheckoutModal();
    });
    $coForm.addEventListener('submit', submitCheckout);
  }

  function openCheckoutModal() {
    ensureCheckoutModal();
    var sub = subtotal();
    var count = itemCount();
    var disc = activeDiscount(sub, count);
    var discAmt = sub * disc.pct;
    var total = sub - discAmt;
    var rows = '<div class="co-row"><dt>Subtotal</dt><dd>' + fmt(sub) + '</dd></div>';
    if (disc.pct > 0) {
      var lbl = disc.source === 'promo' ? 'Promo · FIRST10'
              : 'Bulk · ' + Math.round(disc.pct * 100) + '% off';
      rows += '<div class="co-row co-row--disc"><dt>' + lbl + '</dt><dd>−' + fmt(discAmt) + '</dd></div>';
    }
    rows += '<div class="co-row co-row--total"><dt>Total</dt><dd>' + fmt(total) + '</dd></div>';
    $coSummary.innerHTML = rows;
    $coError.hidden = true;
    $coError.textContent = '';
    $coSubmit.disabled = false;
    $coSubmit.textContent = 'Continue to crypto checkout →';
    $coBackdrop.hidden = false;
    $coModal.hidden = false;
    document.body.classList.add('cart-locked');
    setTimeout(function () { $coEmail.focus(); }, 60);
  }

  function closeCheckoutModal() {
    if (!$coModal) return;
    $coModal.hidden = true;
    $coBackdrop.hidden = true;
    document.body.classList.remove('cart-locked');
  }

  function submitCheckout(e) {
    e.preventDefault();
    var email = ($coEmail.value || '').trim();
    var ship  = ($coShip.value  || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showCoError('Please enter a valid email address.');
    }
    if (ship.length < 10) {
      return showCoError('Please enter a complete shipping address.');
    }
    if (state.items.length === 0) {
      return showCoError('Cart is empty.');
    }
    $coSubmit.disabled = true;
    $coSubmit.textContent = 'Creating invoice…';

    var payload = {
      email:    email,
      shipping: ship,
      promo:    state.promo,
      items:    state.items.map(function (it) {
        return { id: it.id, qty: it.qty, dose: it.dose };
      })
    };

    fetch(PAY_ENDPOINT, {
      method:  'POST',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (body) { return { ok: r.ok, body: body }; });
    }).then(function (resp) {
      if (!resp.ok || !resp.body || !resp.body.invoice_url) {
        var msg = (resp.body && resp.body.error) || 'Could not create invoice.';
        showCoError('Checkout failed: ' + msg + '. Email support@corynthlabs.com if this persists.');
        $coSubmit.disabled = false;
        $coSubmit.textContent = 'Try again';
        return;
      }
      // Stash order id so the post-redirect "thanks" page can show it.
      try { localStorage.setItem('corynth.lastOrder', resp.body.orderId); } catch (e2) {}
      window.location.href = resp.body.invoice_url;
    }).catch(function () {
      showCoError('Network error. Check connection and try again.');
      $coSubmit.disabled = false;
      $coSubmit.textContent = 'Try again';
    });
  }

  function showCoError(msg) {
    $coError.hidden = false;
    $coError.textContent = msg;
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireOnce();
    wirePdpOptions();
    wirePdpQty();
    render();
  });
})();
