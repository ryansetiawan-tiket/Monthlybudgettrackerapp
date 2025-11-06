# FAB System - Visual Design & Behavior

## 🎨 Visual Mockup

### State 1: Collapsed (Default)
```
                                    Screen Edge
                                         ↓
┌────────────────────────────────────────┐
│                                        │
│                                        │
│                                        │
│                                        │
│                                        │
│                                   ┌────┤
│                                   │ +  │  ← Main FAB (56x56px)
│                                   │    │     Primary color
│                                   └────┤
│                                        │
└────────────────────────────────────────┘
          Bottom: 24px, Right: 24px
```

### State 2: Expanded (On Click)
```
                                    Screen Edge
                                         ↓
┌────────────────────────────────────────┐
│                                        │
│                                        │
│                              ┌────┐    │
│                              │ 👁️ │    │  ← Toggle Summary
│                              └────┘    │     (48x48px, white bg)
│                                   ↑    │
│                              ┌────┐    │     12px gap
│                              │ 💰 │    │  ← Add Income
│                              └────┘    │     (48x48px, white bg)
│                                   ↑    │
│                              ┌────┐    │     12px gap
│                              │ 🧾 │    │  ← Add Expense
│                              └────┘    │     (48x48px, white bg)
│                                   ↑    │
│                                   │    │     12px gap
│                              ┌────┐    │
│                              │ ✕  │    │  ← Main FAB
│                              └────┘    │     (rotated 45deg)
│                                        │
└────────────────────────────────────────┘
```

### State 3: Auto-Hidden (Scrolling Down)
```
                                    Screen Edge
                                         ↓
┌────────────────────────────────────────┐
│                                        │
│  User Scrolling Down ↓                 │
│                                        │
│                                        │
│                                        │
│                                       ┌┤  ← Only 10% visible
│                                       ││     Opacity: 0.7
│                                       └┤     translateX(90%)
│                                        │
└────────────────────────────────────────┘
```

### State 4: Manually Hidden (Chevron Clicked)
```
                                    Screen Edge
                                         ↓
┌────────────────────────────────────────┐
│                                        │
│                                        │
│                                        │
│                                        │
│                                        │
│                                      ◀─┤  ← Chevron visible (24x24px)
│                                        │     Rest of FAB off-screen
│                                        │
│                                        │
└────────────────────────────────────────┘
```

## 🎬 Animation Sequences

### Sequence 1: Expand Animation
```
Frame 1 (0ms):
  Main Button: scale(1), rotate(0deg)
  Actions: opacity(0), scale(0), y(20px)

Frame 2 (100ms):
  Main Button: scale(1.1), rotate(22.5deg)
  Action 1 (Expense): opacity(1), scale(1), y(0)

Frame 3 (200ms):
  Main Button: scale(1.1), rotate(45deg)
  Action 2 (Income): opacity(1), scale(1), y(0)

Frame 4 (300ms):
  Action 3 (Summary): opacity(1), scale(1), y(0)
```

### Sequence 2: Auto-Hide on Scroll
```
Event: User scrolls down
  ├─ Immediate: Detect scroll direction
  ├─ 0ms: translateX(0) → translateX(90%)
  ├─ 300ms: Animation completes (spring physics)
  └─ After 2000ms idle:
      └─ translateX(90%) → translateX(0)
```

### Sequence 3: Manual Toggle
```
Click Chevron (when visible):
  ├─ FAB: translateX(0) → translateX(calc(100% - 8px))
  ├─ Chevron icon: ChevronLeft → ChevronRight
  └─ Duration: 300ms spring

Click Chevron (when hidden):
  ├─ FAB: translateX(calc(100% - 8px)) → translateX(0)
  ├─ Chevron icon: ChevronRight → ChevronLeft
  └─ Duration: 300ms spring
```

## 🎯 Icon Design

### Main FAB Icon (Plus)
```typescript
// Default state (collapsed)
<Plus className="w-6 h-6" />

// Expanded state (rotated 45deg = X shape)
<Plus className="w-6 h-6 rotate-45" />
```

### Action Button Icons
```typescript
// Icon 1: Add Expense
<Receipt className="w-5 h-5 text-primary" />

// Icon 2: Add Additional Income
<DollarSign className="w-5 h-5 text-green-600" />

// Icon 3: Toggle Pockets Summary
<Eye className="w-5 h-5 text-blue-600" />
// OR
<EyeOff className="w-5 h-5 text-gray-400" /> // When summary is hidden
```

### Chevron Toggle Icon
```typescript
// When FAB is visible
<ChevronRight className="w-4 h-4 text-primary" />

// When FAB is hidden
<ChevronLeft className="w-4 h-4 text-primary" />
```

## 🎨 Color Palette

### Main FAB
- **Background**: `hsl(var(--primary))` (from globals.css)
- **Text/Icon**: `hsl(var(--primary-foreground))`
- **Shadow**: `0 10px 25px -5px rgba(var(--primary-rgb), 0.2)`
- **Hover**: `hsl(var(--primary) / 0.9)`

### Action Buttons
- **Background**: `hsl(var(--background))`
- **Border**: `2px solid hsl(var(--primary) / 0.2)`
- **Icon Colors**:
  - Expense: `hsl(var(--primary))`
  - Income: `hsl(142, 76%, 36%)` (green-600)
  - Summary: `hsl(221, 83%, 53%)` (blue-600)
- **Hover**: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`

### Chevron Toggle
- **Background**: `rgba(255, 255, 255, 0.8)` + `backdrop-blur-sm`
- **Border**: `1px solid hsl(var(--primary) / 0.2)`
- **Icon**: `hsl(var(--primary))`

## 📏 Spacing & Layout

### Vertical Stack (Expanded State)
```
[Summary Button]
     ↕ 12px gap
[Income Button]
     ↕ 12px gap
[Expense Button]
     ↕ 12px gap
[Main FAB]
```

### Positioning from Screen Edge
```
Mobile:  bottom: 24px, right: 24px
Desktop: bottom: 32px, right: 32px
```

### Safe Zones (Avoid Overlapping)
```
Top Safe Zone: 100px (mobile sticky header)
Bottom Safe Zone: 80px (FAB area)
Right Safe Zone: 80px (FAB area)
```

## 🔄 State Transitions Matrix

| From State | To State | Trigger | Animation Duration |
|------------|----------|---------|-------------------|
| Collapsed | Expanded | Click main FAB | 300ms |
| Expanded | Collapsed | Click main FAB / Click action / Click outside | 200ms |
| Visible | Auto-Hidden | Scroll down | 300ms |
| Auto-Hidden | Visible | Stop scrolling (2s idle) | 300ms |
| Visible | Manually Hidden | Click chevron → | 300ms |
| Manually Hidden | Visible | Click chevron ← | 300ms |
| Expanded | Auto-Hidden | Scroll down while expanded | Collapse first (200ms), then hide (300ms) |

## 🎭 Interactive States

### Main FAB Button
```typescript
// Idle
"bg-primary text-primary-foreground"

// Hover (desktop)
"bg-primary/90 scale-105"

// Active (pressed)
"scale-95"

// Focus (keyboard)
"ring-2 ring-primary ring-offset-2"

// Disabled
"bg-primary/50 cursor-not-allowed"
```

### Action Buttons
```typescript
// Idle
"bg-background border-primary/20"

// Hover
"scale-105 shadow-lg"

// Active
"scale-95"

// Focus
"ring-2 ring-primary ring-offset-1"
```

### Chevron Toggle
```typescript
// Idle
"bg-white/80 backdrop-blur-sm"

// Hover
"bg-white/90 scale-110"

// Active
"scale-90"
```

## 📐 Responsive Behavior

### Mobile (< 768px)
- Main FAB: 56x56px
- Action Buttons: 48x48px
- Bottom spacing: 24px
- Right spacing: 24px
- Auto-hide more aggressive (hide after 1s idle)

### Desktop (>= 768px)
- Main FAB: 64x64px
- Action Buttons: 48x48px
- Bottom spacing: 32px
- Right spacing: 32px
- Auto-hide less aggressive (hide after 2s idle)

### Tablet (768px - 1024px)
- Same as desktop
- Consider left-handed mode (optional)

## 🌙 Dark Mode Support

```typescript
// Main FAB - No changes needed (uses CSS variables)

// Action Buttons
"bg-background border-primary/20"
// Dark mode: bg will be dark, border adapts automatically

// Chevron
"bg-white/80 dark:bg-gray-800/80"
```

## ♿ Accessibility Features

### ARIA Labels
```typescript
<button
  aria-label="Quick Actions"
  aria-expanded={isExpanded}
  aria-haspopup="menu"
>
  {/* Main FAB */}
</button>

<button aria-label="Add Expense">
  {/* Action 1 */}
</button>

<button aria-label="Add Additional Income">
  {/* Action 2 */}
</button>

<button aria-label="Toggle Pockets Summary">
  {/* Action 3 */}
</button>

<button aria-label={isManuallyHidden ? "Show Quick Actions" : "Hide Quick Actions"}>
  {/* Chevron */}
</button>
```

### Keyboard Navigation
- **Tab**: Focus main FAB
- **Enter/Space**: Toggle expand/collapse
- **Arrow Down**: Focus first action (when expanded)
- **Arrow Up**: Focus previous action
- **Escape**: Collapse if expanded

### Touch Target Sizes
- Minimum: 48x48px (WCAG 2.1 Level AAA)
- Main FAB: 56x56px (mobile), 64x64px (desktop) ✓
- Action Buttons: 48x48px ✓
- Chevron: 24x24px visible, but 40x40px touch area

## 🎬 Motion Preferences

```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const animationConfig = prefersReducedMotion 
  ? { duration: 0 }  // Instant transitions
  : { type: "spring", stiffness: 300, damping: 20 }
```

---

**Last Updated**: November 6, 2025
