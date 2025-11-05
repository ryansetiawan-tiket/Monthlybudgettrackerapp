# Visual Design Specification - FAB + Drawer

## 🎨 Component Visual Design

### 1. Floating Action Button (FAB)

#### Desktop Design
```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│           Main Content Area              │
│                                          │
│                                          │
│                                  ┌─────┐ │
│                                  │ 💰  │ │ ← FAB
│                                  └─────┘ │
│                                          │
└──────────────────────────────────────────┘
    Bottom-right: 24px from edges
    Size: 56x56px
    Shadow: lg
```

#### Mobile Design
```
┌──────────────────────┐
│                      │
│   Mobile Content     │
│                      │
│                      │
│              ┌────┐  │
│              │ 💰 │  │ ← FAB
│              └────┘  │
│                      │
└──────────────────────┘
  Bottom-right: 16px
  Size: 48x48px
  Shadow: md
```

#### States

**Default**
```css
Background: hsl(var(--primary))
Icon: White Wallet
Shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)
Scale: 1
Opacity: 1
```

**Hover** (Desktop only)
```css
Scale: 1.1
Shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1)
Transition: 200ms ease-out
```

**Active** (Click)
```css
Scale: 0.95
Shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)
Transition: 100ms ease-in
```

**Focus** (Keyboard)
```css
Ring: 2px solid hsl(var(--ring))
Ring-offset: 2px
```

---

### 2. Drawer Component

#### Drawer Overlay (Backdrop)
```
┌──────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Semi-transparent
│░░░░░░░░░░░░░ BACKDROP ░░░░░░░░░░░░░░░░░│    black overlay
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│    (backdrop-blur-sm)
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓│
││  Drawer Content (slides up from here) ││ ← Drawer panel
│┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛│
└──────────────────────────────────────────┘
```

#### Drawer Content Panel
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Ringkasan Kantong                  [X]┃ ← Header (sticky)
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                         ┃
┃  ┌─────────────────────────────────┐   ┃
┃  │ 💰 Kantong Sehari-hari      ⚙️  │   ┃ ← PocketsSummary
┃  │ Rp 2,500,000                    │   ┃   content
┃  └─────────────────────────────────┘   ┃
┃                                         ┃
┃  ┌─────────────────────────────────┐   ┃
┃  │ ❄️  Kantong Uang Dingin         │   ┃
┃  │ Rp 5,000,000                    │   ┃
┃  └─────────────────────────────────┘   ┃
┃                                         ┃
┃  [+ Kelola Kantong] [💸 Transfer]      ┃ ← Action buttons
┃                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Max Height: 80vh (scrollable if exceed)
Background: White (dark mode: dark background)
Border-radius: 16px 16px 0 0 (top corners rounded)
```

---

### 3. Animation Specifications

#### Drawer Open Animation
```
Initial state:
  - translateY: 100% (fully below viewport)
  - opacity: 0

Animation:
  - Duration: 200ms
  - Easing: ease-out
  - Properties: transform, opacity

Final state:
  - translateY: 0 (visible position)
  - opacity: 1
```

#### Drawer Close Animation
```
Initial state:
  - translateY: 0
  - opacity: 1

Animation:
  - Duration: 150ms
  - Easing: ease-in
  - Properties: transform, opacity

Final state:
  - translateY: 100%
  - opacity: 0
```

#### Backdrop Animation
```
Open:
  - Duration: 200ms
  - From: opacity 0
  - To: opacity 1

Close:
  - Duration: 150ms
  - From: opacity 1
  - To: opacity 0
```

#### FAB Pulse (Optional Enhancement)
```
On mount / when drawer closes:
  - Scale: 1 → 1.1 → 1
  - Duration: 300ms
  - Easing: ease-in-out
  - Delay: 200ms
  - Play once
```

---

### 4. Responsive Breakpoints

#### Mobile (<768px)
```css
FAB:
  - Size: 48x48px
  - Position: bottom-4 right-4
  - Icon: size-5

Drawer:
  - Width: 100vw
  - Height: auto (max 90vh)
  - Padding: 16px
  - Border-radius: 12px 12px 0 0
```

#### Tablet (768px - 1024px)
```css
FAB:
  - Size: 52px
  - Position: bottom-5 right-5
  - Icon: size-5

Drawer:
  - Width: 100vw
  - Height: auto (max 85vh)
  - Padding: 20px
```

#### Desktop (>1024px)
```css
FAB:
  - Size: 56px
  - Position: bottom-6 right-6
  - Icon: size-6

Drawer:
  - Width: 100vw
  - Max-width: 600px (centered)
  - Height: auto (max 80vh)
  - Padding: 24px
  - Border-radius: 16px 16px 0 0
```

---

### 5. Color Palette

#### Light Mode
```css
FAB Background: hsl(var(--primary))         /* Blue */
FAB Icon: hsl(var(--primary-foreground))    /* White */
FAB Hover: hsl(var(--primary) / 0.9)        /* Darker blue */

Backdrop: hsl(0 0% 0% / 0.5)                /* Semi-transparent black */
Drawer Background: hsl(var(--background))    /* White */
Drawer Border: hsl(var(--border))           /* Light gray */

Header Text: hsl(var(--foreground))         /* Dark text */
```

#### Dark Mode
```css
FAB Background: hsl(var(--primary))         /* Blue */
FAB Icon: hsl(var(--primary-foreground))    /* White */
FAB Hover: hsl(var(--primary) / 0.9)        /* Darker blue */

Backdrop: hsl(0 0% 0% / 0.7)                /* Darker backdrop */
Drawer Background: hsl(var(--card))         /* Dark card bg */
Drawer Border: hsl(var(--border))           /* Dark border */

Header Text: hsl(var(--card-foreground))    /* Light text */
```

---

### 6. Typography

#### Drawer Header
```css
Font-family: inherit (system font)
Font-size: 18px (text-lg)
Font-weight: 600 (font-semibold)
Line-height: 1.5
Color: foreground
```

#### Content Area
```css
Inherits from PocketsSummary component
(No changes needed)
```

---

### 7. Accessibility Indicators

#### Focus Visible
```
All interactive elements:
  - Ring: 2px solid ring color
  - Ring-offset: 2px
  - Outline: none (use ring instead)
```

#### ARIA Labels
```tsx
FAB:
  aria-label="Tampilkan ringkasan kantong"
  aria-expanded={drawerOpen}

Drawer:
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-title"
  aria-describedby="drawer-description"

Close Button:
  aria-label="Tutup ringkasan kantong"
```

#### Screen Reader Text
```tsx
<DrawerDescription className="sr-only">
  Lihat ringkasan semua kantong budget Anda
</DrawerDescription>
```

---

### 8. Interaction States Summary

| Element | Idle | Hover | Active | Focus | Disabled |
|---------|------|-------|--------|-------|----------|
| FAB | Default | Scale 1.1 | Scale 0.95 | Ring outline | N/A |
| Backdrop | Transparent | N/A | N/A | N/A | N/A |
| Close Button | Default | Background gray | Background darker | Ring outline | N/A |

---

### 9. Z-Index Layers

```
Layout layers (from bottom to top):
  1. Main content: z-0
  2. FAB: z-50
  ...
  100. Drawer backdrop: z-100
  101. Drawer content: z-101
  ...
  200. Dialogs (from drawer): z-200+
```

**Important**: Dialogs yang dibuka dari drawer (Settings, Transfer, Manage Pockets) harus punya z-index lebih tinggi dari drawer.

---

### 10. Loading State (Future Enhancement)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Ringkasan Kantong                  [X]┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                         ┃
┃  ┌─────────────────────────────────┐   ┃
┃  │ ████████░░░░░░░░░░░░░░░░░░░     │   ┃ ← Skeleton
┃  │ ████░░░░░░░░░░░░░░░░░░░░░░░     │   ┃   loading
┃  └─────────────────────────────────┘   ┃
┃                                         ┃
┃  ┌─────────────────────────────────┐   ┃
┃  │ ████████░░░░░░░░░░░░░░░░░░░     │   ┃
┃  │ ████░░░░░░░░░░░░░░░░░░░░░░░     │   ┃
┃  └─────────────────────────────────┘   ┃
┃                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

(Currently not needed as PocketsSummary already has LoadingSkeleton)

---

## 🎬 User Flow Visualization

### Flow 1: Open Drawer
```
[User scrolling content]
         ↓
[Sees FAB at bottom-right]
         ↓
[Clicks FAB] ← Smooth scale animation
         ↓
[Backdrop fades in] ← 200ms
         ↓
[Drawer slides up] ← 200ms ease-out
         ↓
[Content visible with all pockets]
```

### Flow 2: Close Drawer
```
[Drawer open with content]
         ↓
[User clicks backdrop / presses Esc / clicks X]
         ↓
[Drawer slides down] ← 150ms ease-in
         ↓
[Backdrop fades out] ← 150ms
         ↓
[Back to main view with FAB visible]
```

### Flow 3: Open Dialog from Drawer
```
[Drawer open]
         ↓
[User clicks Settings gear on Sehari-hari pocket]
         ↓
[BudgetSettings dialog opens] ← z-index 200
         ↓
[Drawer stays in background] ← z-index 101
         ↓
[User edits budget & saves]
         ↓
[Dialog closes]
         ↓
[Drawer updates with new data] ← Realtime update
         ↓
[User closes drawer when done]
```

---

## 📱 Platform-Specific Notes

### iOS Safari
- Handle safe area insets for notched devices
- Test bottom sheet gesture (may conflict with Safari gestures)
- Ensure smooth scroll in drawer content

### Android Chrome
- Test with system navigation gestures
- Verify backdrop touch doesn't trigger behind content
- Check drawer height with on-screen keyboard

### Desktop Browsers
- Ensure Esc key works to close
- Test with different viewport sizes
- Verify hover states work properly
- Check backdrop-blur performance

---

**Status**: 📐 Design Specification Complete  
**Ready for**: Implementation Phase
