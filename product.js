/* ============================================================
   CORYNTH LABS — Product detail page interactions
   - Vial-size selector (GLP-3 only)
   - Quantity stepper
   - Thumbnail active state
   Accordions use native <details>/<summary>, no JS needed.
   ============================================================ */
(function () {

    // --- Vial-size selector -------------------------------------------------
    var vialOpts = document.querySelectorAll('[data-vial-opt]');
    if (vialOpts.length) {
        var cta       = document.querySelector('[data-cart-pdp]');
        var ctaPrice  = cta ? cta.querySelector('.pdp-cta__price') : null;
        var skuLabel  = document.getElementById('pdpSku');
        var mediaCode = document.querySelector('[data-media-code]');
        var mediaImg  = document.querySelector('[data-media-img]');
        var specMass  = document.querySelector('[data-spec-mass]');

        function fmt(p) {
            return '$' + Number(p).toFixed(2);
        }

        vialOpts.forEach(function (btn) {
            btn.addEventListener('click', function () {
                vialOpts.forEach(function (b) { b.classList.remove('pdp-option--active'); });
                btn.classList.add('pdp-option--active');

                var price = btn.dataset.price;
                var sku   = btn.dataset.sku;
                var code  = btn.dataset.code;
                var img   = btn.dataset.image;
                var mass  = btn.dataset.mass;

                if (ctaPrice) ctaPrice.textContent = fmt(price);
                if (cta) {
                    cta.dataset.price = price;
                    cta.dataset.code  = code;
                    cta.dataset.mass  = mass + ' mg';
                    cta.dataset.image = img;
                    cta.dataset.id    = 'retatrutide-' + mass + 'mg';
                    cta.dataset.name  = 'Retatrutide ' + mass + 'mg';
                }
                if (skuLabel)  skuLabel.textContent = 'SKU · ' + sku;
                if (mediaCode) mediaCode.textContent = code;
                if (mediaImg)  mediaImg.src = img;
                if (specMass)  specMass.textContent = mass + ' mg';
            });
        });
    }

    // --- Quantity stepper ---------------------------------------------------
    var qtyInput = document.querySelector('[data-qty-input]');
    var qtyDec   = document.querySelector('[data-qty-dec]');
    var qtyInc   = document.querySelector('[data-qty-inc]');
    if (qtyInput && qtyDec && qtyInc) {
        function clamp(n) {
            n = parseInt(n, 10);
            if (isNaN(n) || n < 1) n = 1;
            if (n > 99) n = 99;
            return n;
        }
        qtyDec.addEventListener('click', function () {
            qtyInput.value = clamp(qtyInput.value) - 1 || 1;
        });
        qtyInc.addEventListener('click', function () {
            qtyInput.value = clamp(clamp(qtyInput.value) + 1);
        });
        qtyInput.addEventListener('input', function () {
            qtyInput.value = String(clamp(qtyInput.value));
        });
    }

    // --- Thumbnail active toggle --------------------------------------------
    var thumbs = document.querySelectorAll('.pdp-thumb');
    thumbs.forEach(function (t) {
        t.addEventListener('click', function () {
            thumbs.forEach(function (x) { x.classList.remove('pdp-thumb--active'); });
            t.classList.add('pdp-thumb--active');
        });
    });

})();
