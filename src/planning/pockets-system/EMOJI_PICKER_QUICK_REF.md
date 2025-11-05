# 🚀 Emoji Picker - Quick Reference

## Installation
```bash
# Already installed in this project
# If needed in future: npm install emoji-picker-react
```

## Import
```typescript
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
```

## Basic Usage
```tsx
<EmojiPicker
  onEmojiClick={(emojiData: EmojiClickData) => {
    console.log(emojiData.emoji); // "😀"
    setYourState(emojiData.emoji);
  }}
/>
```

## Current Implementation
**File:** `/components/ManagePocketsDialog.tsx`

```tsx
<Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start h-10">
      <span className="text-2xl">{newPocketIcon}</span>
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-full p-0 border-0" align="start">
    <EmojiPicker
      onEmojiClick={(emojiData: EmojiClickData) => {
        setNewPocketIcon(emojiData.emoji);
        setEmojiPickerOpen(false);
      }}
      width={350}
      height={400}
      theme={Theme.DARK}
      searchPlaceHolder="Cari emoji..."
      previewConfig={{ showPreview: false }}
    />
  </PopoverContent>
</Popover>
```

## Configuration Options

### Theme
```tsx
import { Theme } from 'emoji-picker-react';

theme={Theme.LIGHT}  // Light mode
theme={Theme.DARK}   // Dark mode (current)
theme={Theme.AUTO}   // Auto detect from system
```

### Dimensions
```tsx
width={350}          // Width in pixels
height={400}         // Height in pixels
```

### Search
```tsx
searchPlaceHolder="Cari emoji..."     // Custom placeholder
searchDisabled={false}                 // Enable/disable search
```

### Preview
```tsx
previewConfig={{
  showPreview: false,              // Hide emoji preview
  // OR
  showPreview: true,
  defaultCaption: "Pick emoji",
  defaultEmoji: "1f600"
}}
```

### Categories
```tsx
categories={[
  {
    category: "suggested",
    name: "Recently Used"
  },
  // Default categories are auto-included
]}
```

### Skin Tones
```tsx
skinTonesDisabled={false}        // Enable skin tones (default)
defaultSkinTone={Skin.NEUTRAL}   // Default skin tone
```

## EmojiClickData Object
```typescript
interface EmojiClickData {
  emoji: string;              // "😀"
  unified: string;            // "1f600"
  names: string[];            // ["grinning face"]
  unifiedWithoutSkinTone: string;
  imageUrl?: string;
  activeSkinTone?: string;
}
```

## Examples

### With Dialog
```tsx
const [open, setOpen] = useState(false);
const [selectedEmoji, setSelectedEmoji] = useState('😀');

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>{selectedEmoji}</Button>
  </DialogTrigger>
  <DialogContent>
    <EmojiPicker
      onEmojiClick={(emojiData) => {
        setSelectedEmoji(emojiData.emoji);
        setOpen(false);
      }}
      theme={Theme.DARK}
    />
  </DialogContent>
</Dialog>
```

### With Custom Styling
```tsx
<div className="rounded-lg overflow-hidden shadow-lg">
  <EmojiPicker
    width="100%"
    height={500}
    theme={Theme.DARK}
  />
</div>
```

### Multiple Pickers
```tsx
const [iconEmoji, setIconEmoji] = useState('😀');
const [categoryEmoji, setCategoryEmoji] = useState('📁');

// Picker 1
<EmojiPicker
  onEmojiClick={(data) => setIconEmoji(data.emoji)}
/>

// Picker 2
<EmojiPicker
  onEmojiClick={(data) => setCategoryEmoji(data.emoji)}
/>
```

## Search Keywords Examples

| Keyword | Results |
|---------|---------|
| `money` | 💰💵💴💶💷💸💳🏦💎🪙 |
| `food` | 🍕🍔🍟🌭🍿🥗🍜🍱 |
| `smile` | 😀😃😄😁😆😅🤣😂 |
| `travel` | ✈️🚗🚕🚙🚌🚎🏝️🗺️ |
| `heart` | ❤️💖💗💓💕💞💝💟 |
| `star` | ⭐🌟✨💫🌠⚡ |
| `house` | 🏠🏡🏘️🏚️🏗️🏢 |
| `book` | 📖📚📕📗📘📙 |
| `game` | 🎮🎯🎲🎰🎳🎴 |

## Skin Tone Support

### Emojis with Skin Tones
All human emojis support skin tones:
- 👋 Wave
- 👍 Thumbs up
- 👎 Thumbs down
- 🤝 Handshake
- 💪 Flexed biceps
- 🙏 Folded hands
- And many more!

### How to Use
1. **Click and hold** on a human emoji
2. Skin tone selector appears
3. **Click** your preferred tone
4. Emoji with selected tone is inserted

### Skin Tone Values
```typescript
enum Skin {
  NEUTRAL = "neutral",
  "1F3FB" = "1f3fb",  // Light
  "1F3FC" = "1f3fc",  // Medium-Light
  "1F3FD" = "1f3fd",  // Medium
  "1F3FE" = "1f3fe",  // Medium-Dark
  "1F3FF" = "1f3ff",  // Dark
}
```

## Performance Tips

1. **Lazy Loading**: Library auto lazy-loads categories
2. **Virtual Scrolling**: Only visible emojis are rendered
3. **Memoization**: Use `React.memo` if re-rendering parent
4. **Single Instance**: Don't render multiple pickers unnecessarily

## Troubleshooting

### Picker not showing
- Check `open` state is `true`
- Verify Popover/Dialog is open
- Check z-index conflicts

### Search not working
- Ensure `searchDisabled={false}` (default)
- Use English keywords
- Library has built-in search data

### Theme not applying
- Verify `theme={Theme.DARK}` prop
- Check CSS conflicts
- Ensure parent doesn't override styles

### Emojis not displaying
- Check font support on system
- Verify emoji string is valid
- Test with basic emoji like "😀"

## Best Practices

1. **Always close picker after selection**
   ```tsx
   onEmojiClick={(data) => {
     setEmoji(data.emoji);
     setPickerOpen(false); // ✅
   }}
   ```

2. **Use with controlled state**
   ```tsx
   const [open, setOpen] = useState(false);
   <Popover open={open} onOpenChange={setOpen}>
   ```

3. **Set reasonable dimensions**
   ```tsx
   width={350}   // Not too wide
   height={400}  // Not too tall
   ```

4. **Disable preview for compact UI**
   ```tsx
   previewConfig={{ showPreview: false }}
   ```

5. **Use dark theme for dark UI**
   ```tsx
   theme={Theme.DARK}
   ```

## Resources

- **NPM Package**: https://www.npmjs.com/package/emoji-picker-react
- **GitHub Repo**: https://github.com/ealush/emoji-picker-react
- **Live Demo**: https://ealush.github.io/emoji-picker-react
- **Issues**: https://github.com/ealush/emoji-picker-react/issues

## Migration from Custom Implementation

### Before (Custom)
```tsx
const EMOJI_CATEGORIES = {
  keuangan: ['💰', '💳', ...],
  // ...
};

<Tabs>
  <TabsList>
    {categories.map(cat => <TabsTrigger>{cat}</TabsTrigger>)}
  </TabsList>
  <TabsContent>
    {emojis.map(emoji => (
      <button onClick={() => setEmoji(emoji)}>
        {emoji}
      </button>
    ))}
  </TabsContent>
</Tabs>
```

### After (Library)
```tsx
<EmojiPicker
  onEmojiClick={(data) => setEmoji(data.emoji)}
  theme={Theme.DARK}
/>
```

**Benefits:**
- ✅ 100+ lines → 10 lines
- ✅ 72 emojis → 1800+ emojis
- ✅ No search → Working search
- ✅ Manual tracking → Auto recent emojis
- ✅ No skin tones → Full support

---

**Quick Start:** Just copy the implementation from ManagePocketsDialog.tsx!

**Last Updated:** November 5, 2025
