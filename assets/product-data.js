/* ============================================================
   CORYNTH LABS — Product data + PDP populator
   Reads ?id=<slug> from the URL and rewrites the PDP in place.
   Falls back to retatrutide-10mg if the id is unknown.
   Must load BEFORE cart.js so the cart reads the populated DOM.
   ============================================================ */
(function () {
  'use strict';

  var IMG_BASE = './Corynth Labs — Research-Grade Peptides_files/';

  var PRODUCTS = {
    'retatrutide-10mg': {
      eyebrow: 'Retatrutide',
      title: 'GLP-3',
      category: 'GLP-3',
      sku: 'CL-GLP3-10',
      crumbCurrent: 'Retatrutide 10mg',
      pageTitle: 'Retatrutide 10mg — Corynth Labs',
      doses: [
        { name: '10 mg', price: 60, active: true },
        { name: '20 mg', price: 110, switchTo: 'retatrutide-20mg' }
      ],
      batch: 'RT-2604-A',
      bio: 'Triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors. Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'Retatrutide (LY3437943)',
        molWeight: '4,731.4 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '10 mg'
      },
      image: 'vial-glp3-10mg-small.png',
      imageAlt: 'Corynth Labs Retatrutide 10mg research vial',
      imageCode: 'GLP-3 · 10MG'
    },

    'retatrutide-20mg': {
      eyebrow: 'Retatrutide',
      title: 'GLP-3',
      category: 'GLP-3',
      sku: 'CL-GLP3-20',
      crumbCurrent: 'Retatrutide 20mg',
      pageTitle: 'Retatrutide 20mg — Corynth Labs',
      doses: [
        { name: '10 mg', price: 60, switchTo: 'retatrutide-10mg' },
        { name: '20 mg', price: 110, active: true }
      ],
      batch: 'RT-2604-B',
      bio: 'Triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors. Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'Retatrutide (LY3437943)',
        molWeight: '4,731.4 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '20 mg'
      },
      image: 'vial-glp3-20mg-small.png',
      imageAlt: 'Corynth Labs Retatrutide 20mg research vial',
      imageCode: 'GLP-3 · 20MG'
    },

    'ghkcu-50mg': {
      eyebrow: 'GHK-Cu',
      title: 'GHK-CU',
      category: 'Copper Peptide',
      sku: 'CL-GHKCU-50',
      crumbCurrent: 'GHK-Cu 50mg',
      pageTitle: 'GHK-Cu 50mg — Corynth Labs',
      doses: [
        { name: '50 mg', price: 45, active: true }
      ],
      batch: 'GH-2603-B',
      bio: 'Copper-binding tripeptide (Glycyl-L-Histidyl-L-Lysine) complexed with Cu(II). Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'Gly-His-Lys · Cu²⁺',
        molWeight: '402.92 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '50 mg'
      },
      image: 'vial-ghkcu-50mg-small.png',
      imageAlt: 'Corynth Labs GHK-Cu 50mg research vial',
      imageCode: 'GHK-CU · 50MG'
    },

    'motsc-10mg': {
      eyebrow: 'MOTS-c',
      title: 'MOTS-C',
      category: 'Mitochondrial Peptide',
      sku: 'CL-MOTSC-10',
      crumbCurrent: 'MOTS-c 10mg',
      pageTitle: 'MOTS-c 10mg — Corynth Labs',
      doses: [
        { name: '10 mg', price: 50, active: true }
      ],
      batch: 'MC-2602-A',
      bio: 'Mitochondrial-derived 16-amino-acid peptide encoded within the 12S rRNA region of mitochondrial DNA. Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'MOTS-c (16 aa)',
        molWeight: '2,174.6 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '10 mg'
      },
      image: 'vial-motsc-10mg-small.png',
      imageAlt: 'Corynth Labs MOTS-c 10mg research vial',
      imageCode: 'MOTS-C · 10MG'
    },

    'cjc-ipa-10mg': {
      eyebrow: 'CJC-1295 / Ipamorelin',
      title: 'CJC / IPA',
      category: 'GHRH / GHRP Blend',
      sku: 'CL-CJCIPA-10',
      crumbCurrent: 'CJC-1295 / Ipamorelin 10mg',
      pageTitle: 'CJC-1295 / Ipamorelin 10mg — Corynth Labs',
      doses: [
        { name: '10 mg', price: 50, active: true }
      ],
      batch: 'CI-2601-C',
      bio: 'Blend of a long-acting GHRH analog (CJC-1295) with a selective growth-hormone-releasing peptide (Ipamorelin). Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'CJC-1295 + Ipamorelin (blend)',
        molWeight: '3,367.9 / 711.85 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '10 mg total'
      },
      image: 'vial-glp3-10mg-small.png',
      imageAlt: 'Corynth Labs CJC-1295 / Ipamorelin 10mg research vial',
      imageCode: 'CJC/IPA · 10MG'
    },

    'bpc-tb-20mg': {
      eyebrow: 'BPC-157 / TB-500',
      title: 'BPC / TB',
      category: 'Healing Blend',
      sku: 'CL-BPCTB-20',
      crumbCurrent: 'BPC-157 / TB-500 20mg',
      pageTitle: 'BPC-157 / TB-500 20mg — Corynth Labs',
      doses: [
        { name: '20 mg', price: 100, active: true }
      ],
      batch: 'BT-2604-D',
      bio: 'Blend of pentadecapeptide BPC-157 (Body Protection Compound) with a thymosin-β4 active fragment (TB-500). Lyophilized powder, ≥98% purity, third-party tested. For laboratory research use only. Not for human or veterinary use.',
      specs: {
        sequence: 'BPC-157 + TB-500 (blend)',
        molWeight: '1,419.5 / 4,963.4 g/mol',
        form: 'Lyophilized powder',
        purity: '≥ 98% (HPLC)',
        dosePerVial: '20 mg total'
      },
      image: 'vial-motsc-10mg-small.png',
      imageAlt: 'Corynth Labs BPC-157 / TB-500 20mg research vial',
      imageCode: 'BPC/TB · 20MG'
    }
  };

  function getId() {
    var match = location.search.match(/[?&]id=([^&]+)/);
    var id = match ? decodeURIComponent(match[1]) : '';
    return PRODUCTS[id] ? id : 'retatrutide-10mg';
  }

  function setText(sel, value) {
    var el = document.querySelector(sel);
    if (el && value != null) el.textContent = value;
  }

  function populate(p, id) {
    /* Page title */
    if (p.pageTitle) document.title = p.pageTitle;

    /* Header / breadcrumb */
    setText('.pdp-info__eyebrow', p.eyebrow);
    setText('.pdp-info__title',   p.title);
    setText('#pdpCrumbCat',       p.category);
    setText('#pdpCrumbCurrent',   p.crumbCurrent);
    setText('#pdpSku',            'SKU · ' + p.sku);

    /* Variation count */
    var varCount = p.doses.length;
    setText('.pdp-info__var', varCount === 1 ? '1 size' : varCount + ' variations');

    /* Quick info batch */
    setText('.pdp-quick__batch', 'Batch ' + p.batch);

    /* Bio */
    setText('.pdp-info__desc', p.bio);

    /* Image + code */
    var img = document.querySelector('.pdp-media__stage img');
    if (img) {
      img.src = IMG_BASE + p.image;
      if (p.imageAlt) img.alt = p.imageAlt;
    }
    setText('.pdp-media__code', p.imageCode);

    /* Dose buttons — always exactly 2 in markup; we hide the second when only one dose */
    var optButtons = document.querySelectorAll('.pdp-options__row .pdp-option');
    optButtons.forEach(function (btn, i) {
      var d = p.doses[i];
      if (!d) {
        btn.style.display = 'none';
        btn.removeAttribute('data-pdp-switch');
        return;
      }
      btn.style.display = '';
      btn.classList.toggle('pdp-option--active', !!d.active);
      var nameEl  = btn.querySelector('.pdp-option__name');
      var priceEl = btn.querySelector('.pdp-option__price');
      if (nameEl)  nameEl.textContent  = d.name;
      if (priceEl) priceEl.textContent = '$' + d.price.toFixed(2) + (d.price % 1 === 0 ? '' : '');
      if (d.switchTo) btn.setAttribute('data-pdp-switch', d.switchTo);
      else btn.removeAttribute('data-pdp-switch');
    });

    /* Cart CTA price reflects active dose */
    var activeDose = p.doses.filter(function (d) { return d.active; })[0] || p.doses[0];
    var ctaPrice = document.querySelector('.pdp-cta--primary .pdp-cta__price');
    if (ctaPrice && activeDose) ctaPrice.textContent = '$' + activeDose.price.toFixed(2);

    /* Specs */
    var specRows = document.querySelectorAll('.pdp-spec > div');
    var specOrder = ['sequence', 'molWeight', 'form', 'purity', 'dosePerVial'];
    specRows.forEach(function (row, i) {
      var key = specOrder[i];
      if (!key) return;
      var dd = row.querySelector('dd');
      if (dd && p.specs[key] != null) dd.textContent = p.specs[key];
    });

    /* Documentation row */
    setText('#pdpDocBatch', 'COA · Batch ' + p.batch);

    /* Tag the body so other scripts can read the active product */
    document.body.setAttribute('data-product-id', id);
  }

  /* In-place variant swap — no full page reload, no jump. */
  function switchTo(toId) {
    var p = PRODUCTS[toId];
    if (!p) return;
    populate(p, toId);
    if (window.CorynthPdp && CorynthPdp.refreshCtaPrice) CorynthPdp.refreshCtaPrice();
    /* Update URL silently so refresh / share keeps the variant. */
    try {
      var newUrl = location.pathname + '?id=' + encodeURIComponent(toId) + location.hash;
      history.replaceState(null, '', newUrl);
    } catch (e) {}
  }

  /* Delegated dose-switch — capture phase so we win against cart.js' active-toggle. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pdp-option[data-pdp-switch]');
    if (!btn) return;
    var to = btn.getAttribute('data-pdp-switch');
    if (!to) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    switchTo(to);
  }, true);

  /* PDP rails → open the cart drawer with that rail pre-selected. */
  document.addEventListener('click', function (e) {
    var rail = e.target.closest && e.target.closest('.pdp-pay-rail[data-pay-rail]');
    if (!rail) return;
    e.preventDefault();
    var which = rail.getAttribute('data-pay-rail');
    if (window.CorynthCart) {
      if (CorynthCart.setRail) CorynthCart.setRail(which);
      if (CorynthCart.open)    CorynthCart.open();
    }
  });

  /* Bulk-tier highlight — listen to cart and light up rows the cart qualifies for.
     Tier mapping mirrors cart.js: 10% if subtotal>=150 OR count>=3,
     18% if subtotal>=400, 25% if subtotal>=800. */
  function qualifies(pct, sub, count) {
    if (pct === 10) return sub >= 150 || count >= 3;
    if (pct === 18) return sub >= 400;
    if (pct === 25) return sub >= 800;
    return false;
  }
  function paintTiers(detail) {
    var rows = document.querySelectorAll('.pdp-tiers__list li[data-tier-pct]');
    if (!rows.length) return;
    var sub = detail ? detail.subtotal : 0;
    var count = detail ? detail.count : 0;
    rows.forEach(function (li) {
      var pct = parseInt(li.getAttribute('data-tier-pct'), 10);
      li.classList.toggle('pdp-tiers__item--on', qualifies(pct, sub, count));
    });
  }
  document.addEventListener('cart:render', function (e) { paintTiers(e.detail); });

  /* Initial run + initial paint (cart.js may have already rendered before us) */
  document.addEventListener('DOMContentLoaded', function () {
    var id = getId();
    populate(PRODUCTS[id], id);
    /* If cart already rendered (it dispatches on DOMContentLoaded too), pull state once. */
    if (window.CorynthCart && CorynthCart.state) {
      var s = CorynthCart.state;
      var sub = (s.items || []).reduce(function (a, i) { return a + i.price * i.qty; }, 0);
      var ct  = (s.items || []).reduce(function (a, i) { return a + i.qty; }, 0);
      paintTiers({ subtotal: sub, count: ct });
    }
  });
})();
