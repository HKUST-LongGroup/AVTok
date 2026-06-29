/* ===========================================================================
   AVTok project page — gallery + audio/video playback
   ---------------------------------------------------------------------------
   Behaviour
   - Galleries are built from window.AVTOK_GALLERIES (static/videos/manifest.js).
   - Every clip is a "sounding video": it carries both a video and an audio
     stream in one .mp4 file.
   - Cards sit PAUSED on their first frame until hovered.
   - HOVER a card  -> that clip restarts and plays with sound; all others
     pause and reset to their first frame.
   - LEAVE a card  -> it pauses and resets to the beginning.
   - CLICK a card  -> toggles "pinned" sound/playback on/off (survives
     mouse-out). Unpinning resets to the beginning.
   - Only ONE clip is ever playing/audible at a time.
   =========================================================================== */
(function () {
  "use strict";

  var TASK_META = {
    v2a: {
      title: "Video-to-Audio Generation",
      blurb: "Given the video, the AR model generates a synchronized, semantically aligned audio track. Hover to hear the generated sound."
    },
    a2v: {
      title: "Audio-to-Video Generation",
      blurb: "Given the audio track, the AR model generates the matching video. Hover to play the conditioning audio with the generated video."
    },
    cjavg: {
      title: "Class-Conditional Joint Audio-Video Generation",
      blurb: "From a single class label, the AR model jointly generates both the video and its audio. Hover to play."
    }
  };

  // The currently active card (only one plays/is audible at a time).
  var activeCard = null;

  // The "voice" of a card is the clip that carries audio: the single video.
  function voiceOf(card) {
    return card.querySelector("video");
  }

  function setAudible(card, on) {
    var voice = voiceOf(card);
    if (!voice) return;
    var all = card.querySelectorAll("video");
    if (on) {
      if (activeCard && activeCard !== card) setAudible(activeCard, false);
      // restart every clip in the card together, unmute only the voice
      all.forEach(function (v) {
        v.currentTime = 0;
        v.muted = v !== voice;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      });
      card.classList.add("is-audio");
      card.querySelector(".sound-icon").innerHTML = '<i class="fas fa-volume-up"></i>';
      activeCard = card;
    } else {
      // pause, mute, and reset to the first frame
      all.forEach(function (v) {
        v.pause();
        v.muted = true;
        v.currentTime = 0;
      });
      card.classList.remove("is-audio");
      card.querySelector(".sound-icon").innerHTML = '<i class="fas fa-volume-mute"></i>';
      if (activeCard === card) activeCard = null;
    }
  }

  function makeCard(item) {
    var card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML =
      '<video src="' + item.src + '" loop muted playsinline preload="auto"></video>' +
      '<span class="badge"><span class="dot"></span>sounding video</span>' +
      '<span class="sound-icon"><i class="fas fa-volume-mute"></i></span>';

    var video = card.querySelector("video");
    var pinned = false; // click-to-keep-sound

    // Force the first frame to paint without playing: nudge currentTime so the
    // browser decodes and shows a frame instead of a blank box.
    video.addEventListener("loadedmetadata", function () {
      video.muted = true;
      try { video.currentTime = 0.001; } catch (e) {}
    });
    video.addEventListener("loadeddata", function () {
      video.pause();
    });

    card.addEventListener("mouseenter", function () {
      if (!pinned) setAudible(card, true);
      card.classList.add("is-active");
    });
    card.addEventListener("mouseleave", function () {
      if (!pinned) setAudible(card, false);
      card.classList.remove("is-active");
    });
    card.addEventListener("click", function () {
      pinned = !pinned;
      if (pinned) {
        setAudible(card, true);
      } else {
        setAudible(card, false);
      }
    });

    return card;
  }

  function buildGallery(task, mountId) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var items = (window.AVTOK_GALLERIES && window.AVTOK_GALLERIES[task]) || [];
    if (!items.length) {
      mount.innerHTML =
        '<div class="gallery-empty">No clips found. Add <code>.mp4</code> files in ' +
        "<code>static/videos/" + task + "/</code>" +
        " and re-run <code>python static/js/gen_manifest.py</code>.</div>";
      return;
    }
    var grid = document.createElement("div");
    grid.className = "video-grid";
    items.forEach(function (item) {
      grid.appendChild(makeCard(item));
    });
    mount.innerHTML = "";
    mount.appendChild(grid);
  }

  // Tabbed switching between the four galleries.
  function initTabs() {
    var tabs = document.querySelectorAll(".gallery-tabs li");
    var panels = document.querySelectorAll(".gallery-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var task = tab.getAttribute("data-task");
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        panels.forEach(function (p) {
          var on = p.getAttribute("data-task") === task;
          p.style.display = on ? "block" : "none";
          if (!on) {
            // pause and reset anything playing in a hidden panel
            p.querySelectorAll("video").forEach(function (v) {
              v.pause();
              v.muted = true;
              v.currentTime = 0;
            });
            p.querySelectorAll(".video-card.is-audio").forEach(function (c) {
              c.classList.remove("is-audio");
              var icon = c.querySelector(".sound-icon");
              if (icon) icon.innerHTML = '<i class="fas fa-volume-mute"></i>';
            });
            activeCard = null;
          }
        });
        var meta = TASK_META[task];
        var t = document.getElementById("gallery-title");
        var b = document.getElementById("gallery-blurb");
        if (meta) { t.textContent = meta.title; b.textContent = meta.blurb; }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ["v2a", "a2v", "cjavg"].forEach(function (task) {
      buildGallery(task, "gallery-" + task);
    });
    initTabs();
    // show first panel
    var first = document.querySelector('.gallery-tabs li[data-task="v2a"]');
    if (first) first.click();
  });
})();
