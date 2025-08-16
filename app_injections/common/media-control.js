(function () {
  if (window._mediaControlSetUp) return;

  let blocked = false;
  const wasPlaying = new WeakMap();
  const wasMuted = new WeakMap();

  function mediaListDeep(root = document) {
    const out = new Set();
    function walk(node) {
      try {
        if (node.querySelectorAll) {
          node.querySelectorAll("video,audio").forEach((m) => out.add(m));
          node.querySelectorAll("iframe").forEach((f) => {
            try {
              if (f.contentDocument) walk(f.contentDocument);
            } catch {}
          });
        }
        if (node.shadowRoot) walk(node.shadowRoot);
      } catch {}
    }
    walk(root);
    return Array.from(out);
  }

  function pauseOne(m) {
    try {
      wasPlaying.set(m, !m.paused && m.readyState > 2);
      wasMuted.set(m, m.muted);
      m.autoplay = false;
      m.removeAttribute("autoplay");
      m.muted = true;
      m.pause();
      m.setAttribute("data-media-blocked", "1");
    } catch {}
  }

  function resumeOne(m) {
    try {
      const shouldPlay = wasPlaying.get(m);
      const prevMuted = wasMuted.get(m);
      if (prevMuted !== undefined) m.muted = prevMuted;
      if (shouldPlay) m.play().catch(() => {});
    } catch {}
  }

  function pauseAll() {
    mediaListDeep().forEach(pauseOne);
    try {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    } catch {}
  }

  function resumeAll() {
    mediaListDeep().forEach(resumeOne);
  }

  document.addEventListener(
    "play",
    (ev) => {
      if (!blocked) return;
      const t = ev.target;
      if (!t || (t.tagName !== "VIDEO" && t.tagName !== "AUDIO")) return;
      try {
        t.muted = true;
        t.pause();
      } catch {}
    },
    true
  );

  (function () {
    const origPlay = HTMLMediaElement.prototype.play;
    if (!origPlay.__wrapped) {
      HTMLMediaElement.prototype.play = function () {
        if (blocked) {
          try {
            this.muted = true;
            this.pause();
          } catch {}
          return Promise.resolve();
        }
        return origPlay.apply(this, arguments);
      };
      HTMLMediaElement.prototype.play.__wrapped = true;
    }
  })();

  const mo = new MutationObserver(() => {
    if (!blocked) return;
    mediaListDeep().forEach((m) => {
      if (!m.paused) pauseOne(m);
    });
  });
  try {
    mo.observe(document, { subtree: true, childList: true });
  } catch {}

  function setActive(active) {
    const newBlocked = !active;
    if (newBlocked === blocked) return;
    blocked = newBlocked;
    if (blocked) pauseAll();
    else resumeAll();
  }

  function computeActive() {
    return document.hasFocus() && !document.hidden;
  }

  let lastActive = computeActive();
  const interval = setInterval(() => {
    const a = computeActive();
    if (a !== lastActive) {
      setActive(a);
      lastActive = a;
    }
  }, 250);

  document.addEventListener("visibilitychange", () =>
    setActive(!document.hidden)
  );
  window.addEventListener("blur", () => setActive(false));
  window.addEventListener("focus", () => setActive(true));

  window.__setWebviewActive = (active) => setActive(!!active);

  window._mediaControlSetUp = true;
  console.log("[IC] 🎚 Media control module loaded");
})();
