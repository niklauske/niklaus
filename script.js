document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
    }));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  async function shareContent(title) {
    const data = { title: title || document.title, text: "Check this out!", url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.url);
        showToast("Link copied to clipboard!");
      } else showToast("Sharing is not supported in this browser.");
    } catch (error) {
      if (error.name !== "AbortError") showToast("Unable to share this link.");
    }
  }
  document.querySelectorAll("[data-share]").forEach(button =>
    button.addEventListener("click", () => shareContent(button.dataset.title)));
  document.getElementById("heroShare")?.addEventListener("click", () => shareContent("Check out YOUR NAME"));

  const audio = document.getElementById("audio");
  const player = document.getElementById("player");
  const playerArt = document.getElementById("playerArt");
  const playerTitle = document.getElementById("playerTitle");
  const playerStatus = document.getElementById("playerStatus");
  const playerToggle = document.getElementById("playerToggle");
  const playerSeek = document.getElementById("playerSeek");
  const playerTime = document.getElementById("playerTime");
  const playerClose = document.getElementById("playerClose");
  let currentButton = null;

  function timeString(value) {
    if (!Number.isFinite(value)) return "0:00";
    return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
  }
  function updateButtons(playing) {
    document.querySelectorAll("[data-play]").forEach(button => {
      button.textContent = button === currentButton && playing ? "Ⅱ" : "▶";
    });
  }
  async function playTrack(button) {
    const source = button.dataset.play;
    if (!audio || !player || !source) return;
    const absoluteSource = new URL(source, document.baseURI).href;
    if (audio.src !== absoluteSource) {
      audio.src = source;
      if (playerTitle) playerTitle.textContent = button.dataset.title || "Unknown track";
      if (playerArt) {
        playerArt.className = "player-art";
        if (/^art-[1-4]$/.test(button.dataset.art || "")) playerArt.classList.add(button.dataset.art);
      }
      if (playerSeek) playerSeek.value = 0;
    }
    currentButton = button;
    player.hidden = false;
    try {
      await audio.play();
      if (playerStatus) playerStatus.textContent = "Now playing";
      updateButtons(true);
    } catch {
      if (playerStatus) playerStatus.textContent = "Unable to play audio";
      showToast("Check that the audio file exists in the audio folder.");
    }
  }
  document.querySelectorAll("[data-play]").forEach(button =>
    button.addEventListener("click", () => playTrack(button)));

  if (audio) {
    audio.addEventListener("timeupdate", () => {
      if (playerSeek && audio.duration) playerSeek.value = (audio.currentTime / audio.duration) * 100;
      if (playerTime) playerTime.textContent = timeString(audio.currentTime);
    });
    audio.addEventListener("play", () => {
      if (playerToggle) playerToggle.textContent = "Ⅱ";
      if (playerStatus) playerStatus.textContent = "Now playing";
      updateButtons(true);
    });
    audio.addEventListener("pause", () => {
      if (playerToggle) playerToggle.textContent = "▶";
      updateButtons(false);
    });
    audio.addEventListener("ended", () => {
      if (playerStatus) playerStatus.textContent = "Track ended";
    });
  }
  playerToggle?.addEventListener("click", async () => {
    if (!audio?.src) return showToast("Choose a track first.");
    if (audio.paused) {
      try { await audio.play(); } catch { showToast("Unable to play this track."); }
    } else audio.pause();
  });
  playerSeek?.addEventListener("input", () => {
    if (audio?.duration) audio.currentTime = Number(playerSeek.value) / 100 * audio.duration;
  });
  playerClose?.addEventListener("click", () => {
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
    if (player) player.hidden = true;
    currentButton = null;
    updateButtons(false);
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add("visible"));

  const toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", () => toTop.classList.toggle("visible", window.scrollY > 400));
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Client-side checks only. Netlify handles form submissions after deployment.
  for (const [formId, messageId, progressText] of [
    ["contactForm", "contactMsg", "Sending message..."],
    ["subscribeForm", "subscribeMsg", "Submitting subscription..."]
  ]) {
    const form = document.getElementById(formId);
    const message = document.getElementById(messageId);
    form?.addEventListener("submit", event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }
      if (message) message.textContent = progressText;
    });
  }
});
