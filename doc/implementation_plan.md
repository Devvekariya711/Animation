# Phase 1: Proof of Concept Implementation Plan

**Goal:** Validate head tracking + parallax math using static PNG layers

---

## Project Structure

```
e:\2.5D\
├── doc/                    # Documentation
├── src/
│   ├── index.html
│   ├── css/styles.css
│   ├── js/
│   │   ├── main.js         # App initialization
│   │   ├── scene.js        # Three.js scene
│   │   ├── tracker.js      # MediaPipe tracking
│   │   ├── parallax.js     # Parallax math
│   │   └── utils.js        # Smoothing filters
│   └── assets/             # PNG layers
├── package.json
└── README.md
```

---

## Layer Configuration

| Layer | Z Position | Scale |
|-------|-----------|-------|
| Background | Z = -10 | 3x |
| Mid-ground | Z = 0 | 1x |
| Foreground | Z = 2 | 0.8x |

---

## Core Math

### Parallax Mapping
```javascript
Camera.X = -(Head.X * Sensitivity)  // Inverted
```

### Lerp Smoothing
```javascript
currentPos = currentPos + (targetPos - currentPos) * 0.1
```

---

## Verification Steps

1. **Scene Rendering** - Layers visible in correct depth
2. **Webcam Active** - Permission granted, tracking starts
3. **Face Tracking** - Confidence >70% when face centered
4. **Parallax Effect** - Foreground moves opposite to head
5. **Low Light** - Light booster activates at <50% confidence
