# synth

A lightweight browser-based synth/sequencer app.

## Run locally

Because this project uses ES modules, `index.html` **cannot** be opened directly with a `file://` URL. Browsers require modules to be loaded from a local HTTP server.

Use any of the options below from the project root (`/workspace/synth`):

### Option 1: `npx serve`

```bash
npx serve .
```

- By default, this prints a local URL (commonly `http://localhost:3000`).
- Open that URL in your browser.

### Option 2: `python3 -m http.server`

```bash
python3 -m http.server 8000
```

- Then open: `http://localhost:8000`

### Option 3: VS Code Live Server

1. Open this folder in VS Code.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` and choose **Open with Live Server** (or click **Go Live** in the status bar).
4. Open the local URL shown by Live Server.
