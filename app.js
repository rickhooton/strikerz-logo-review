(function () {
  "use strict";

  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var panel = document.getElementById("selection-panel");
  var replyText = document.getElementById("reply-text");
  var copyBtn = document.getElementById("copy-btn");
  var mailtoLink = document.getElementById("mailto-link");
  var copyStatus = document.getElementById("copy-status");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var boardToggle = document.getElementById("board-toggle");
  var boardPreview = document.getElementById("board-preview");
  var boardMedia = document.getElementById("board-media");
  var boardToggleHint = document.getElementById("board-toggle-hint");

  var selected = null;

  function choiceText(card) {
    return "We choose " + card.dataset.label;
  }

  function updateSelection(card) {
    selected = card;
    cards.forEach(function (c) {
      c.classList.toggle("is-selected", c === card);
      var btn = c.querySelector(".btn-select");
      if (btn) {
        btn.textContent = c === card ? "Selected" : "Select";
        btn.setAttribute("aria-pressed", c === card ? "true" : "false");
      }
    });

    var text = choiceText(card);
    replyText.textContent = text;
    panel.hidden = false;

    var subject = encodeURIComponent("Strikerz logo pick");
    var body = encodeURIComponent(text);
    mailtoLink.href = "mailto:?subject=" + subject + "&body=" + body;

    copyStatus.textContent = "";
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function openLightboxFrom(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption + " — full view";
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxClose.focus();
  }

  function openLightbox(card) {
    openLightboxFrom(card.dataset.file, card.dataset.label);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImg.removeAttribute("src");
  }

  cards.forEach(function (card) {
    var selectBtn = card.querySelector(".btn-select");
    var mediaBtns = Array.prototype.slice.call(card.querySelectorAll(".card-media"));

    if (selectBtn) {
      selectBtn.setAttribute("aria-pressed", "false");
      selectBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        updateSelection(card);
      });
    }

    mediaBtns.forEach(function (mediaBtn) {
      mediaBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var view = mediaBtn.getAttribute("data-view");
        if (view === "mock" && card.dataset.mock) {
          openLightboxFrom(card.dataset.mock, card.dataset.label + " on ST350");
        } else {
          openLightbox(card);
        }
      });
    });

    card.addEventListener("click", function (e) {
      if (e.target.closest(".btn-select")) return;
      if (e.target.closest(".card-media")) return;
      openLightbox(card);
    });
  });

  if (boardToggle && boardPreview) {
    boardToggle.addEventListener("click", function () {
      var open = boardToggle.getAttribute("aria-expanded") === "true";
      var next = !open;
      boardToggle.setAttribute("aria-expanded", next ? "true" : "false");
      boardPreview.hidden = !next;
      if (boardToggleHint) {
        boardToggleHint.textContent = next ? "Hide preview" : "Show preview";
      }
    });
  }

  if (boardMedia) {
    boardMedia.addEventListener("click", function (e) {
      e.stopPropagation();
      openLightboxFrom(boardMedia.dataset.file, boardMedia.dataset.name);
    });
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });

  copyBtn.addEventListener("click", function () {
    if (!selected) return;
    var text = choiceText(selected);

    function success() {
      copyStatus.textContent = "Copied to clipboard!";
      setTimeout(function () {
        if (copyStatus.textContent === "Copied to clipboard!") {
          copyStatus.textContent = "";
        }
      }, 2200);
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        success();
      } catch (err) {
        copyStatus.textContent = "Select the text above and copy manually.";
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(success).catch(fallback);
    } else {
      fallback();
    }
  });
})();
