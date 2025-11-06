# FAB System - Visual States Reference

## 🎨 Complete State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FAB STATE MACHINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐   Click FAB    ┌──────────────┐          │
│  │  COLLAPSED   │ ────────────────▶│   EXPANDED   │          │
│  │   (Default)  │                  │  (3 Actions) │          │
│  └──────────────┘ ◀────────────────┘──────────────┘          │
│         │         Click FAB/Action        │                  │
│         │                                 │                  │
│         │ Scroll Down                     │ Scroll Down      │
│         ▼                                 ▼                  │
│  ┌──────────────┐                  ┌──────────────┐          │
│  │  AUTO-HIDDEN │                  │AUTO-HIDDEN + │          │
│  │   (90% off)  │                  │  COLLAPSED   │          │
│  └──────────────┘                  └──────────────┘          │
│         │                                 │                  │
│         │ 2s Idle / Scroll Up             │                  │
│         ▼                                 ▼                  │
│  ┌──────────────┐                  ┌──────────────┐          │
│  │  COLLAPSED   │                  │   EXPANDED   │          │
│  └──────────────┘                  └──────────────┘          │
│         │                                                    │
│         │ Click Chevron                                      │
│         ▼                                                    │
│  ┌──────────────┐   Click Chevron  ┌──────────────┐          │
│  │   MANUALLY   │ ◀────────────────│  COLLAPSED   │          │
│  │    HIDDEN    │                  │              │          │
│  │(Only Chevron)│                  │              │          │
│  └──────────────┘                  └──────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 State-by-State Visual Breakdown

### State 1: COLLAPSED (Default)

**Description**: FAB is visible but action buttons are hidden

**Visual Appearance**:
```
                                    ┃ Screen Edge
                                    ┃
                                    ┃
                                    ┃    ┌────────┐
                                    ┃    │   +    │  ← Plus Icon (white)
                                    ┃    │        │     Centered
                                    ┃ ◀──│        │     56×56px (mobile)
                                    ┃    │        │     64×64px (desktop)
                                    ┃    └────────┘
                                    ┃        ▲
                                    ┃        │
                                    ┃    Primary Color
                                    ┃    Shadow-lg
                                    ┃
                              Bottom: 24px (mobile)
                              Right: 24px (mobile)
```

**CSS Classes**:
```css
.main-fab {
  width: 56px;           /* md:w-16 (64px) */
  height: 56px;          /* md:h-16 (64px) */
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
  position: fixed;
  bottom: 1.5rem;        /* md:bottom-8 (2rem) */
  right: 1.5rem;         /* md:right-8 (2rem) */
  z-index: 40;
}
```

**Animation State**:
- scale: 1
- rotate: 0deg
- opacity: 1
- translateX: 0

---

### State 2: EXPANDED (Showing Actions)

**Description**: FAB is clicked, 3 action buttons are visible above it

**Visual Appearance**:
```
                                    ┃ Screen Edge
                                    ┃
                              ┌─────┃─────┐
                              │  👁️ ┃     │  ← Action 3: Toggle Summary
                              └─────┃─────┘     48×48px, blue icon
                                    ┃            Delay: 200ms
                                    ┃ ↕ 12px gap
                              ┌─────┃─────┐
                              │  💰 ┃     │  ← Action 2: Add Income
                              └─────┃─────┘     48×48px, green icon
                                    ┃            Delay: 100ms
                                    ┃ ↕ 12px gap
                              ┌─────┃─────┐
                              │  🧾 ┃     │  ← Action 1: Add Expense
                              └─────┃─────┘     48×48px, primary icon
                                    ┃            Delay: 0ms
                                    ┃ ↕ 12px gap
                              ┌─────┃─────┐
                              │  ✕  ┃     │  ← Main FAB
                              └─────┃─────┘     Rotated 45deg (X shape)
                                    ┃            scale: 1.1
                                    ┃
```

**Stagger Animation Sequence**:
```
t=0ms:   Main FAB rotates, scales to 1.1
t=0ms:   Action 1 (Expense) appears (scale 0→1, y 20→0)
t=100ms: Action 2 (Income) appears (scale 0→1, y 20→0)
t=200ms: Action 3 (Summary) appears (scale 0→1, y 20→0)
t=300ms: Animation complete
```

**Action Button CSS**:
```css
.action-button {
  width: 48px;
  height: 48px;
  background: hsl(var(--background));
  border: 2px solid hsl(var(--primary) / 0.2);
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15);
}
```

---

### State 3: AUTO-HIDDEN (Scrolling Down)

**Description**: User scrolls down, FAB slides right leaving 10% visible

**Visual Appearance**:
```
                                    ┃ Screen Edge
                                    ┃
                                    ┃   Visible: 10%
                                    ┃   ↓
                                    ┃──────┐
                                    ┃   +  │  ← Only 10% visible
                                    ┃──────┘     Opacity: 0.7
                                    ┃            translateX(90%)
                                    ┃
                                    ┃
                               User Scrolling ↓
```

**Animation**:
```typescript
// Spring physics animation
{
  x: "90%",              // Slides right
  opacity: 0.7,          // Slightly transparent
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30
  }
}
```

**Trigger**: 
- Scroll direction changes to 'down'
- Debounced at 16ms intervals

**Return Trigger**:
- Scroll stops for 2000ms (idle timeout)
- OR scroll direction changes to 'up'

---

### State 4: MANUALLY HIDDEN (Chevron Clicked)

**Description**: User clicks chevron, FAB completely hidden except chevron

**Visual Appearance**:
```
                                    ┃ Screen Edge
                                    ┃
                                    ┃
                                    ┃◀──┃  ← Chevron button visible
                                    ┃   ┃     24×24px
                                    ┃   ┃     ChevronLeft icon
                                    ┃   ┃     (pointing left)
                                    ┃   ┃     8px visible
   [Hidden FAB is off-screen] ──────┃   ┃
                                    ┃   ┃
                                    ┃
```

**Chevron CSS**:
```css
.chevron-button {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid hsl(var(--primary) / 0.2);
  border-radius: 9999px;
  position: absolute;
  left: -8px;            /* Positioned at FAB's left edge */
  top: 50%;
  transform: translateY(-50%);
}
```

**Animation**:
```typescript
{
  x: "calc(100% - 8px)",  // Almost completely off-screen
  opacity: 0.5,           // Half transparent
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30
  }
}
```

---

### State 5: COLLAPSED + AUTO-HIDDEN

**Description**: FAB was expanded, user scrolls down, collapses then hides

**Animation Sequence**:
```
Step 1 (0-200ms):   Collapse animation
  └─ Action buttons disappear (reverse stagger)
  └─ Plus icon rotates back to 0deg
  └─ FAB scales back to 1

Step 2 (200-500ms): Auto-hide animation
  └─ FAB slides right (translateX 90%)
  └─ Opacity reduces to 0.7
```

**Visual Progression**:
```
Frame 1: EXPANDED
  ┌─────┐
  │  👁️ │
  └─────┘
  ┌─────┐
  │  💰 │
  └─────┘
  ┌─────┐
  │  🧾 │
  └─────┘
  ┌─────┐
  │  ✕  │  ← Expanded, scale 1.1, rotate 45deg
  └─────┘

Frame 2 (100ms): Collapsing
  ┌─────┐
  │  👁️ │ ← fading (opacity 0.5)
  └─────┘
  ┌─────┐
  │  💰 │ ← fading (opacity 0.3)
  └─────┘
  ┌─────┐
  │  +  │ ← rotating (22.5deg)
  └─────┘

Frame 3 (200ms): Collapsed
  ┌─────┐
  │  +  │ ← scale 1, rotate 0deg
  └─────┘

Frame 4 (300ms): Starting Hide
  ┌─────┐
  │  + ─┃ ← sliding right
  └─────┘

Frame 5 (500ms): Auto-Hidden
  ──────┃ ← 90% off-screen
   +  ─┃
  ──────┃
```

---

## 🎨 Color Specifications

### Main FAB
```css
Background: hsl(var(--primary))              /* Primary brand color */
Foreground: hsl(var(--primary-foreground))   /* White or contrast color */
Shadow: 0 10px 25px -5px rgba(var(--primary-rgb), 0.2)
```

### Action Buttons
```css
/* Base */
Background: hsl(var(--background))           /* White (light), Dark (dark mode) */
Border: 2px solid hsl(var(--primary) / 0.2)  /* Subtle primary border */
Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* Icons */
Expense Icon: hsl(var(--primary))            /* Primary color */
Income Icon: hsl(142, 76%, 36%)              /* Green-600 */
Summary Icon: hsl(221, 83%, 53%)             /* Blue-600 */

/* Hover */
Shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15)
Transform: scale(1.05)
```

### Chevron Toggle
```css
Background: rgba(255, 255, 255, 0.8)         /* Semi-transparent white */
Backdrop-Filter: blur(8px)                   /* Glassmorphism */
Border: 1px solid hsl(var(--primary) / 0.2)
Icon Color: hsl(var(--primary))
```

---

## 🎭 Interactive States

### Main FAB Button States

#### Idle (Default)
```css
transform: scale(1) rotate(0deg);
background: hsl(var(--primary));
cursor: pointer;
```

#### Hover (Desktop Only)
```css
background: hsl(var(--primary) / 0.9);
transform: scale(1.05);
transition: all 150ms ease;
```

#### Active (Pressed)
```css
transform: scale(0.95);
transition: all 100ms ease;
```

#### Focus (Keyboard)
```css
outline: 2px solid hsl(var(--primary));
outline-offset: 2px;
```

#### Expanded
```css
transform: scale(1.1) rotate(45deg);
```

---

### Action Button States

#### Idle
```css
transform: scale(1);
opacity: 1;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

#### Hover
```css
transform: scale(1.05);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
transition: all 150ms ease;
```

#### Active
```css
transform: scale(0.95);
```

#### Disabled
```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

---

### Chevron Button States

#### Hidden State (FAB Visible)
```css
opacity: 0;
pointer-events: none;
transform: translateY(-50%) scale(0);
```

#### Visible State (FAB Visible)
```css
opacity: 1;
pointer-events: auto;
transform: translateY(-50%) scale(1);
```

#### Visible State (FAB Hidden)
```css
opacity: 1;
transform: translateY(-50%) scale(1);
/* FAB is at translateX(calc(100% - 8px)) */
```

---

## 📱 Responsive State Changes

### Mobile (<768px)

**Dimensions**:
```
Main FAB: 56×56px
Action Buttons: 48×48px
Chevron: 24×24px (40×40px touch area)
```

**Positioning**:
```css
.fab-container {
  bottom: 1.5rem;    /* 24px */
  right: 1.5rem;     /* 24px */
}
```

**Auto-Hide Timing**:
```typescript
idleTimeout = 1000  // 1 second (faster on mobile)
```

---

### Desktop (>=768px)

**Dimensions**:
```
Main FAB: 64×64px
Action Buttons: 48×48px
Chevron: 24×24px
```

**Positioning**:
```css
.fab-container {
  bottom: 2rem;      /* 32px */
  right: 2rem;       /* 32px */
}
```

**Auto-Hide Timing**:
```typescript
idleTimeout = 2000  // 2 seconds
```

---

## 🌙 Dark Mode Variations

### Main FAB (No Change)
```css
/* Uses CSS variables, adapts automatically */
background: hsl(var(--primary));
color: hsl(var(--primary-foreground));
```

### Action Buttons
```css
/* Light Mode */
background: hsl(0, 0%, 100%);           /* White */
border: 2px solid hsl(var(--primary) / 0.2);

/* Dark Mode */
background: hsl(222, 47%, 11%);         /* Dark gray */
border: 2px solid hsl(var(--primary) / 0.2);
```

### Chevron
```css
/* Light Mode */
background: rgba(255, 255, 255, 0.8);

/* Dark Mode */
background: rgba(31, 41, 55, 0.8);      /* Gray-800 with opacity */
```

---

## ⚡ Animation Timing Reference

### Expand Animation
```
Total Duration: 300ms
Main FAB Rotation: 0ms - 150ms (ease-out)
Main FAB Scale: 0ms - 150ms (ease-out)
Action 1 Appear: 0ms - 200ms (spring)
Action 2 Appear: 100ms - 300ms (spring)
Action 3 Appear: 200ms - 400ms (spring)
```

### Collapse Animation
```
Total Duration: 200ms
Action 3 Disappear: 0ms - 150ms (ease-in)
Action 2 Disappear: 0ms - 150ms (ease-in)
Action 1 Disappear: 0ms - 150ms (ease-in)
Main FAB Rotation: 50ms - 200ms (ease-in)
Main FAB Scale: 50ms - 200ms (ease-in)
```

### Auto-Hide Animation
```
Total Duration: ~300ms (spring physics)
translateX: 0 → 90% (spring)
opacity: 1 → 0.7 (linear)
Spring Config:
  stiffness: 300
  damping: 30
```

### Manual Hide Animation
```
Total Duration: ~300ms (spring physics)
translateX: 0 → calc(100% - 8px) (spring)
opacity: 1 → 0.5 (linear)
Chevron Icon: ChevronRight → ChevronLeft (rotation)
```

---

## 🎯 Z-Index Layering Diagram

```
┌─────────────────────────────────────┐
│   z-index: 50 - DIALOGS             │  ← Top Layer
│   (AddExpenseDialog, etc.)          │
├─────────────────────────────────────┤
│   z-index: 45 - DIALOG OVERLAYS     │
├─────────────────────────────────────┤
│   z-index: 40 - FAB                 │  ← Our FAB
│   (FloatingActionButton)            │
├─────────────────────────────────────┤
│   z-index: 30 - DROPDOWNS/POPOVERS  │
├─────────────────────────────────────┤
│   z-index: 20 - STICKY HEADER       │
│   (Mobile sticky header)            │
├─────────────────────────────────────┤
│   z-index: 10 - ELEVATED CONTENT    │
├─────────────────────────────────────┤
│   z-index: 0 - BASE CONTENT         │  ← Bottom Layer
└─────────────────────────────────────┘
```

---

## 🔍 Visual Testing Checklist

- [ ] Main FAB visible in all states
- [ ] Action buttons aligned vertically
- [ ] 12px gap maintained between actions
- [ ] Plus icon centered perfectly
- [ ] Icon rotation smooth (no jumps)
- [ ] Stagger timing feels natural
- [ ] Auto-hide leaves exactly 10% visible
- [ ] Chevron positioned at FAB's left edge
- [ ] Shadows render correctly
- [ ] Borders crisp and clean
- [ ] Colors match design system
- [ ] Dark mode adapts properly
- [ ] Responsive breakpoints work
- [ ] No layout shift on mount
- [ ] Animations run at 60fps

---

**Last Updated**: November 6, 2025  
**Version**: 1.0.0  
**Status**: Visual Specification Complete
