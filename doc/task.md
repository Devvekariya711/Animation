# PARALLAX-CORE: Interactive Parallax Video Platform
## Master Task Tracker (All Phases)

> **Project Duration:** Phase 1 → Phase 4 (Until Mobile App Deployment)  
> **Last Updated:** December 07, 2025

---

## 🎯 CURRENT FOCUS: Phase 2 - Web Player

---

## Phase 0: Project Foundation
- [x] **Environment Setup**
  - [x] Initialize Git repository and connect to GitHub
  - [x] Create project folder structure
  - [x] Setup Node.js development environment
  - [x] Install core dependencies (Three.js, MediaPipe)
  - [x] Setup TestSprite MCP for automated testing
  - [x] Create initial HTML/CSS boilerplate

---

## Phase 1: Proof of Concept (Local Prototype)
**Objective:** Validate math and tracking logic using static images locally.

### 1.1 Asset Preparation
- [x] Create placeholder layer images (or use test assets)
  - [x] `layer_bg.png` - Background layer (sky, mountains)
  - [x] `layer_mid.png` - Mid-ground layer (trees, buildings)
  - [x] `layer_char.png` - Foreground layer (characters)
- [x] Document asset specifications (resolution, transparency)

### 1.2 Three.js Scene Configuration
- [x] Setup basic Three.js scene with WebGL renderer
- [x] Configure virtual camera at `Z = 5`
- [x] Create plane geometries for each layer
- [x] Position layers in 3D space:
  - [x] Background at `Z = -10` (3x scale)
  - [x] Mid-ground at `Z = 0`
  - [x] Foreground at `Z = 2`
- [x] Implement texture loading for PNG layers
- [x] Verify scene renders correctly from front view

### 1.3 MediaPipe Face Tracking Integration
- [x] Initialize webcam stream in browser
- [x] Load MediaPipe Face Mesh model
- [x] Extract nose tip coordinates (Landmark 1)
- [x] Normalize coordinates to -1.0 to +1.0 range
- [x] Display tracking confidence percentage
- [x] Handle webcam permission errors gracefully

### 1.4 Parallax Math Implementation
- [x] Map head X position to camera X (inverted)
- [x] Map head Y position to camera Y (inverted)
- [x] Implement sensitivity controls
- [x] Add Linear Interpolation (Lerp) smoothing
- [x] Optional: Implement One Euro Filter for jitter reduction

### 1.5 Off-Axis Projection
- [x] Research and implement off-axis projection matrix
- [x] Connect camera frustum to head position
- [x] Test "window into another world" effect

### 1.6 Low Light Handling
- [x] Create "Light Booster" CSS overlay
- [x] Detect tracking confidence drop (<50%)
- [x] Trigger screen border flash when needed
- [x] Add manual toggle for light booster

### 1.7 Phase 1 Testing & Validation
- [x] Test parallax effect on different monitors
- [x] Verify smooth 60 FPS rendering
- [x] Document performance metrics
- [x] Create demo recording
- [x] User acceptance testing

---

## Phase 2: Web Player (Functional Web App)
**Objective:** Replace static images with video loops and enable browser accessibility.

### 2.1 Video Asset Integration
- [/] Research WebM/HEVC with alpha channel support
- [ ] Create video loading pipeline
- [ ] Implement video texture mapping to Three.js planes
- [ ] Handle video loop synchronization

### 2.2 Multi-Layer Video Sync
- [ ] Pre-load all video assets into memory buffer
- [ ] Implement precise millisecond sync start
- [ ] Add playback controls (play/pause/seek)
- [ ] Handle audio track (if present)

### 2.3 Web Deployment
- [ ] Setup production build configuration
- [ ] Deploy to hosting platform (Vercel/Netlify)
- [ ] Create shareable demo URL
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 2.4 Performance Optimization
- [ ] Implement progressive loading
- [ ] Add quality settings (Low/Medium/High)
- [ ] Optimize for mobile browsers
- [ ] Add loading states and error handling

---

## Phase 3: The Platform (Backend Integration)
**Objective:** Create the minimalist ecosystem for uploading and viewing content.

### 3.1 Backend Development
- [ ] Setup Node.js backend server
- [ ] Configure MongoDB for metadata storage
- [ ] Setup AWS S3 for video layer storage
- [ ] Create RESTful API endpoints

### 3.2 Content Management
- [ ] Build admin upload interface
- [ ] Implement 3-layer video linking system
- [ ] Add video metadata management
- [ ] Create content categorization

### 3.3 Minimalist Frontend Experience
- [ ] Remove all social features (no comments, likes, recommendations)
- [ ] Design pure focus viewer interface
- [ ] Implement fullscreen mode
- [ ] Add keyboard shortcuts

### 3.4 User Features
- [ ] User authentication (optional)
- [ ] Watch history (local storage)
- [ ] Favorites/bookmarks
- [ ] Quality preferences

---

## Phase 4: Mobile Ecosystem (Native App)
**Objective:** Port the experience to mobile with hardware-specific features.

### 4.1 Mobile App Development
- [ ] Choose framework (Flutter vs React Native)
- [ ] Setup mobile development environment
- [ ] Port Three.js rendering to mobile
- [ ] Implement mobile face tracking

### 4.2 Gyroscope Fallback
- [ ] Detect low-light camera failure
- [ ] Implement gyroscope-based head tracking
- [ ] Smooth transition between tracking modes
- [ ] Calibration interface for gyroscope

### 4.3 Haptic Feedback Engine
- [ ] Define haptic JSON schema
- [ ] Create haptic timeline editor
- [ ] Map timestamps to vibration patterns
- [ ] Implement Low/Medium/Heavy vibration levels

### 4.4 App Store Deployment
- [ ] Prepare Google Play Store listing
- [ ] Prepare Apple App Store listing
- [ ] Create app screenshots and preview video
- [ ] Submit for review
- [ ] Post-launch monitoring

---

## 🧪 Testing Checkpoints (TestSprite MCP)

| Checkpoint | Phase | Test Type | Status |
|------------|-------|-----------|--------|
| CP1.1 | Phase 1 | Scene renders correctly | [x] |
| CP1.2 | Phase 1 | Face tracking works | [x] |
| CP1.3 | Phase 1 | Parallax effect visible | [x] |
| CP2.1 | Phase 2 | Video layers sync | [ ] |
| CP2.2 | Phase 2 | Web deployment works | [ ] |
| CP3.1 | Phase 3 | API endpoints functional | [ ] |
| CP3.2 | Phase 3 | Upload pipeline works | [ ] |
| CP4.1 | Phase 4 | Mobile app runs | [ ] |
| CP4.2 | Phase 4 | Haptics work | [ ] |

---

## 📊 Risk Mitigation Tracking

| Risk | Status | Mitigation Implemented |
|------|--------|------------------------|
| Low Light Conditions | 🟢 | [x] Light Booster |
| Webcam Latency | 🟢 | [x] Client-side JS only |
| Jittery Movement | 🟢 | [x] Smoothing filters |
| Video Sync Issues | 🟡 | [ ] Pre-load buffer |

---

## 📝 Notes
- All client-side processing (NO Python on client)
- Target: 60 FPS minimum
- Prioritize responsiveness over visual fidelity
