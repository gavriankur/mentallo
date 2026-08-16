# Mentallo — The Midnight Oracle

A complete, original pull-cord fortune-teller game built with plain HTML, CSS, and JavaScript. It has no dependencies, tracking, backend, login, or external assets.

## Play locally

Open `index.html` directly in a modern browser. For the most consistent speech and audio behavior, serve the folder locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Think of a yes/no-style question, drag the handle downward, and release. On a keyboard, focus the handle and press **Space** or **Enter**.

## Publish with GitHub Pages

1. Create a GitHub repository and add the three project files at its root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

GitHub will provide the public URL after deployment. No build command is required.

## Features

- Pointer Events-based mouse, touch, and pen dragging
- Keyboard support and live-region announcements
- 36 fortunes across positive, negative, uncertain, and mysterious categories
- Eight-answer anti-repeat history
- Optional browser speech synthesis and generated mechanical Web Audio effects
- Reduced-motion support and responsive mobile layout
- Fully offline after the files are downloaded

Browser speech voices vary by device. If speech or Web Audio is unavailable or blocked, the displayed fortune remains fully functional.
