# AVTok Project Page

Static project page for **AVTok: 1D Unified Tokenization for Holistic Audio-Video
Generation**. Built with the Nerfies/Bulma academic template — no build step, just
static files.

```
page/
├── index.html                 # the page
├── static/
│   ├── css/index.css           # styles
│   ├── js/index.js             # gallery + hover/click audio-video playback
│   ├── js/gen_manifest.py      # regenerates the video manifest
│   ├── images/*.png            # figures (rendered from paper/Figures/*.pdf)
│   ├── pdfs/                    # put avtok_paper.pdf here for the "Paper" link
│   └── videos/
│       ├── manifest.js          # auto-generated list of clips (do not hand-edit)
│       ├── v2a/*.mp4            # video-to-audio samples
│       ├── a2v/*.mp4            # audio-to-video samples
│       └── cjavg/*.mp4          # joint audio-video samples
```