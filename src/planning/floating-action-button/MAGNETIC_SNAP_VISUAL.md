# FAB Magnetic Snap - Visual Guide

**Quick visual reference for magnetic snap behavior**

---

## 🧲 Magnetic Zones

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  LEFT ZONE      HYSTERESIS         RIGHT ZONE          │
│  (0-40%)        (40-60%)           (60-100%)          │
│                                                        │
│    🧲              ⚪                🧲                │
│  Snap Left     No Snap           Snap Right           │
│                                                        │
└────────────────────────────────────────────────────────┘
    0%           40%      50%      60%              100%
```

---

## 🎬 Drag Scenarios

### Scenario 1: Drag from RIGHT to LEFT
```
Initial State (FAB on right):
┌────────────────────────────────────┐
│                          [FAB] 🔴 │
└────────────────────────────────────┘

User starts dragging left:
┌────────────────────────────────────┐
│                      [FAB]→        │  (Still on right)
└────────────────────────────────────┘
                           55%

User drags past 40% threshold:
┌────────────────────────────────────┐
│          [FAB]→                    │  (Crossed threshold!)
└────────────────────────────────────┘
               35%

🧲 MAGNETIC SNAP! (Immediate):
┌────────────────────────────────────┐
│  🔵 [FAB]                          │  (Snapped to left)
└────────────────────────────────────┘
```

### Scenario 2: Drag from LEFT to RIGHT
```
Initial State (FAB on left):
┌────────────────────────────────────┐
│ 🔵 [FAB]                           │
└────────────────────────────────────┘

User starts dragging right:
┌────────────────────────────────────┐
│        ←[FAB]                      │  (Still on left)
└────────────────────────────────────┘
         45%

User drags past 60% threshold:
┌────────────────────────────────────┐
│                    ←[FAB]          │  (Crossed threshold!)
└────────────────────────────────────┘
                         65%

🧲 MAGNETIC SNAP! (Immediate):
┌────────────────────────────────────┐
│                          [FAB] 🔴 │  (Snapped to right)
└────────────────────────────────────┘
```

### Scenario 3: Drag in Hysteresis Zone (No Snap)
```
FAB on right, drag to 50% (hysteresis zone):
┌────────────────────────────────────┐
│                  [FAB]             │  (No snap - stays right)
└────────────────────────────────────┘
                    50%
                 (40-60% zone)

FAB on left, drag to 50% (hysteresis zone):
┌────────────────────────────────────┐
│                  [FAB]             │  (No snap - stays left)
└────────────────────────────────────┘
                    50%
                 (40-60% zone)
```

---

## 🎯 Threshold Behavior

### From Right Side
```
Position:  0%      40%      60%     100%
          ├────────┼────────┼────────┤
          │  SNAP  │  STAY  │  STAY  │
          │  LEFT  │ RIGHT  │ RIGHT  │
          └────────┴────────┴────────┘
                   ↑
            Snap threshold
```

### From Left Side
```
Position:  0%      40%      60%     100%
          ├────────┼────────┼────────┤
          │  STAY  │  STAY  │  SNAP  │
          │  LEFT  │  LEFT  │ RIGHT  │
          └────────┴────────┴────────┘
                            ↑
                     Snap threshold
```

---

## 🔄 Visual Feedback During Drag

### RIGHT Side → Dragging Left
```
Start:
[FAB] 🔴  ───────────────────────►
100%                            70%

Moving:
        [FAB]  ─────────────────►
        70%                   50%

Still Right (Hysteresis):
                [FAB]  ────────►
                50%          45%

Cross Threshold:
                    [FAB] ─────►
                    45%      38%
                             ↑
                        Threshold!

🧲 SNAP LEFT:
🔵 [FAB] ◄───────────────────────
0%               ↑
          Instant snap!
```

---

## 🎨 Button Position Changes

### RIGHT Side Layout
```
        ⭐ Income (Jam 12: 0, -90)
            
    🔴 Expense (Jam 10.30: -64, -64)
        
💼 Summary (Jam 9: -90, 0)  ◀ Chevron

        [FAB]
```

### LEFT Side Layout (Mirrored)
```
        ⭐ Income (Jam 12: 0, -90)
            
        🔴 Expense (Jam 1.30: 64, -64)
        
Chevron ▶  💼 Summary (Jam 3: 90, 0)

        [FAB]
```

### Transition Animation
```
RIGHT → LEFT (when snap):
        ⭐                    ⭐
    🔴      →   Snap!   →        🔴
💼 ◀ [FAB]               [FAB] ▶ 💼

Duration: 0.2s ease-out
All elements animate simultaneously
```

---

## 📊 Drag Distance Constraints

```
FAB on RIGHT edge:
┌────────────────────────────────────┐
│                          [FAB]     │
│                          ←100px→   │
│                     Max drag left  │
└────────────────────────────────────┘

FAB on LEFT edge:
┌────────────────────────────────────┐
│     [FAB]                          │
│   ←100px→                          │
│   Max drag right                   │
└────────────────────────────────────┘

Beyond 100px: Elastic resistance
```

---

## 🎭 Chevron Rotation States

### RIGHT Side
```
Visible:              Manual Hide:
   ◀ →                   ◀ ←
  Jam 10.30            Jam 10.30
  rotate: 0°           rotate: 180°
  (Point right)        (Point left)
```

### LEFT Side
```
Visible:              Manual Hide:
   ← ▶                   → ▶
  Jam 1.30             Jam 1.30
  rotate: 180°         rotate: 0°
  (Point left)         (Point right)
```

---

## 🧪 Quick Test Pattern

### Test 1: Slow Drag Left
```
1. Start: FAB on right [FAB]🔴
2. Drag slowly left    ←[FAB]
3. At 40% mark:        🧲 SNAP!
4. Result: 🔵[FAB]     (On left)
```

### Test 2: Quick Swipe Left
```
1. Start: FAB on right [FAB]🔴
2. Quick swipe left    ←←←[FAB]
3. Immediate snap:     🧲 SNAP!
4. Result: 🔵[FAB]     (On left)
```

### Test 3: Drag to Center (No Snap)
```
1. Start: FAB on right [FAB]🔴
2. Drag to 50%         [FAB]
3. Release             [FAB]🔴
4. Result:             (Stays right)
```

### Test 4: Vertical Drag
```
1. Start: FAB on right [FAB]🔴
2. Drag up             [FAB]
                         ↑
3. Release             [FAB]🔴
4. Result:             (Stays right, moved up)
```

---

## 🎯 Expected User Experience

### ✅ Good UX Indicators
- User drags FAB → sees it moving smoothly
- User crosses threshold → sees immediate snap
- User releases drag → FAB stays on edge
- User knows where FAB is → always visible
- User understands behavior → intuitive

### ❌ Bad UX to Avoid
- FAB disappears during drag → FIXED!
- Delayed snap after drag → FIXED!
- Jittery behavior near center → FIXED with hysteresis!
- User confused → PREVENTED!

---

## 📐 Screen Size Examples

### iPhone SE (375px width)
```
Thresholds:
Left:  150px (40%)
Right: 225px (60%)
Hysteresis: 75px wide
```

### iPhone 14 Pro (393px width)
```
Thresholds:
Left:  157px (40%)
Right: 236px (60%)
Hysteresis: 79px wide
```

### Pixel 7 (412px width)
```
Thresholds:
Left:  165px (40%)
Right: 247px (60%)
Hysteresis: 82px wide
```

---

## 🚀 Performance Visualization

### Drag Event Timeline
```
Time:     0ms    50ms   100ms  150ms  200ms
          │      │      │      │      │
Events:   ●──────●──────●──────●──────●
          Drag   Drag   Drag   SNAP!  End
          Start  Check  Check  State  Reset
                                Update
```

### State Updates During Drag
```
Drag Start     → isDragging: true
During Drag    → Check threshold (every onDrag event)
Cross 40%      → fabSide: 'left' (IMMEDIATE)
Drag End       → dragPosition: {x: 0, y: newY}
After 100ms    → isDragging: false
```

---

**Visual Guide v1.0** | November 6, 2025
