(() => {
  const frame = document.querySelector('[data-demo-frame]');
  const theme = document.body.dataset.demoTheme;
  const themeHref = new URL(`h1-demo-${theme}.css`, window.location.href).href;

  const injectTheme = (doc, id, className) => {
    if (!doc?.head || doc.getElementById(id)) return false;
    doc.documentElement.classList.add(className);
    const link = doc.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = themeHref;
    doc.head.appendChild(link);
    return true;
  };

  const prepareReport = childDoc => {
    const reportFrame = childDoc?.querySelector('#reportFrame');
    if (!reportFrame) return;

    const tryInjectReport = () => {
      const reportDoc = reportFrame.contentDocument;
      if (!reportDoc?.body || !reportDoc.body.classList.contains('h1-embedded-report')) return false;
      injectTheme(reportDoc, `h1-demo-${theme}-report`, `h1-demo-${theme}-report`);
      return true;
    };

    reportFrame.addEventListener('load', () => {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (tryInjectReport() || attempts > 80) window.clearInterval(timer);
      }, 150);
    });

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (tryInjectReport() || attempts > 80) window.clearInterval(timer);
    }, 150);
  };

  frame.addEventListener('load', () => {
    const childDoc = frame.contentDocument;
    injectTheme(childDoc, `h1-demo-${theme}-shell`, `h1-demo-${theme}-shell`);
    prepareReport(childDoc);
    document.body.classList.add('demo-ready');
  });
})();
