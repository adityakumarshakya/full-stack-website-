/*
 * Loads a small, safe subset of Website Settings from the backend
 * (logo, social links, WhatsApp number, footer tagline) and applies them
 * to the existing markup. Intentionally conservative: it only overwrites
 * an element when the admin has actually set a value, and it never
 * touches layout, classes, or markup structure — only src/href/text of
 * elements that already exist on the page.
 */
(function () {
  function setLogo(url, alt) {
    if (!url) return;
    document.querySelectorAll('.brand img, .footer-mid img').forEach((img) => {
      img.src = url;
      if (alt) img.alt = alt;
    });
  }

  function setSocial(links) {
    if (!links) return;
    const map = {
      Facebook: links.facebook,
      X: links.twitter,
      Instagram: links.instagram,
      LinkedIn: links.linkedin,
      YouTube: links.youtube,
    };
    Object.keys(map).forEach((label) => {
      const href = map[label];
      if (!href) return;
      const a = document.querySelector(`.socials a[aria-label="${label}"]`);
      if (a) a.href = href;
    });

    if (links.whatsapp) {
      const digits = String(links.whatsapp).replace(/[^\d]/g, '');
      if (digits) {
        const waHref = `https://wa.me/${digits}`;
        document.querySelectorAll('a.wa, a[href^="https://wa.me/"]').forEach((a) => {
          a.href = waHref;
        });
      }
    }
  }

  function setFooterTagline(text) {
    if (!text) return;
    const p = document.querySelector('.footer-mid p');
    if (p) p.textContent = text;
  }

  fetch('/api/public/site-settings')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const settings = data && data.settings;
      if (!settings) return;
      setLogo(settings.logoUrl, settings.siteName);
      setSocial(settings.socialLinks);
      setFooterTagline(settings.footerText);
    })
    .catch(() => {
      // Fail silently: the static markup already has sensible defaults,
      // so a settings-fetch failure should never break the page.
    });
})();
