# YouTube Mixer - Features Guide

## 🎯 What's New

### ✨ Search Modal (NEW!)
Instead of opening YouTube in a new tab, search results now appear in a beautiful modal right inside the app!

**How it works:**
1. Type your search in the header
2. Click "Search" or press Enter
3. Modal opens with video results
4. Hover over any video
5. Click "Load in Deck A" or "Load in Deck B"
6. Video loads instantly!

**Benefits:**
- ✅ No leaving the page
- ✅ One-click loading
- ✅ See thumbnails and info
- ✅ Fast and intuitive
- ✅ Keyboard friendly (ESC to close)

---

## 🔍 Search & Load

### Search Bar (Top of Page)
```
┌─────────────────────────────────────┐
│ [Search YouTube Videos...] [Search] │
└─────────────────────────────────────┘
```

**Shortcuts:**
- Press **Enter** in search box → Triggers search
- Press **ESC** → Closes search modal

### Search Results Modal
```
┌────────────────────────────────────────────┐
│  Search Results                        [×]  │
├────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Video │  │Video │  │Video │  │Video │  │
│  │  1   │  │  2   │  │  3   │  │  4   │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                            │
│  Hover over a video to see load buttons   │
└────────────────────────────────────────────┘
```

**On Hover:**
```
┌──────────────────┐
│   Video Title    │
│   ┌──────────┐   │
│   │ Thumbnail│   │
│   │          │   │
│   │ [Deck A] │   │ ← Click to load in Deck A
│   │ [Deck B] │   │ ← Click to load in Deck B
│   └──────────┘   │
│   Channel Name   │
│   Description... │
└──────────────────┘
```

---

## 🎥 Video Players

### Deck A (Video 1) - Left Side
```
┌─────────────────────────────┐
│ Video 1                     │
├─────────────────────────────┤
│ [YouTube Link 1...] [Load]  │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   YouTube Player 1    │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  [Play] [Pause] [Stop]      │
└─────────────────────────────┘
```

**Keyboard Shortcuts:**
- **Q** = Play
- **W** = Pause
- **E** = Stop

### Deck B (Video 2) - Right Side
```
┌─────────────────────────────┐
│ Video 2                     │
├─────────────────────────────┤
│ [YouTube Link 2...] [Load]  │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   YouTube Player 2    │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  [Play] [Pause] [Stop]      │
└─────────────────────────────┘
```

**Keyboard Shortcuts:**
- **A** = Play
- **S** = Pause
- **D** = Stop

---

## 🎚️ Audio Crossfader

```
        Video 1 ◄──────────────────► Video 2
                    
        ┌─────────────────────────────┐
        │  ○                          │
        └─────────────────────────────┘
        100%                        0%
        
        ┌─────────────────────────────┐
        │            ○                │
        └─────────────────────────────┘
        50%                        50%
        
        ┌─────────────────────────────┐
        │                          ○  │
        └─────────────────────────────┘
        0%                        100%
```

**How it works:**
- **Left:** Video 1 louder, Video 2 quieter
- **Center:** Both videos at equal volume
- **Right:** Video 2 louder, Video 1 quieter

**Shortcuts:**
- **← →** (Arrow Keys) = Adjust in 5% steps
- **Shift + Scroll** = Adjust with mouse wheel

**Technical:**
- Uses constant-power panning algorithm
- Smooth crossfading without volume dips
- Professional DJ-style mixing

---

## ⌨️ Complete Keyboard Shortcuts

### Search
| Key | Action |
|-----|--------|
| **Enter** | Trigger search (when in search box) |
| **ESC** | Close search modal |

### Video 1 (Deck A)
| Key | Action |
|-----|--------|
| **Q** | Play |
| **W** | Pause |
| **E** | Stop |

### Video 2 (Deck B)
| Key | Action |
|-----|--------|
| **A** | Play |
| **S** | Pause |
| **D** | Stop |

### Crossfader
| Key | Action |
|-----|--------|
| **←** | Move left (increase Video 1) |
| **→** | Move right (increase Video 2) |
| **Shift + Scroll** | Adjust with mouse wheel |

---

## 💡 Pro Tips

### DJ-Style Mixing
1. Load a video in each deck
2. Start playing Video 1 (press Q)
3. Cue up Video 2 (load but don't play yet)
4. When ready, press A to start Video 2
5. Use crossfader to transition between them
6. Use keyboard shortcuts for hands-free mixing!

### Quick Search Workflow
1. Type search term
2. Press Enter (don't click button)
3. Hover over desired video
4. Click "Load in Deck A" or "Deck B"
5. Press ESC if you want to close modal
6. Start mixing!

### Parallel Loading
- You can search and load videos while others are playing
- No need to stop playback to load new videos
- Queue up your next track while current one plays

---

## 🎨 Visual Features

### Search Modal
- **Grid Layout:** Videos displayed in responsive grid
- **Hover Effects:** Smooth animations on hover
- **Thumbnails:** High-quality video thumbnails
- **Metadata:** Title, channel, description
- **Loading State:** Spinner while searching
- **Empty State:** Helpful message if no results

### Video Cards
- **Thumbnail:** Medium-quality preview image
- **Overlay:** Appears on hover with action buttons
- **Color-Coded Buttons:**
  - Deck A = Red (#e63946)
  - Deck B = Blue (#457b9d)
- **Smooth Animations:** Fade-in overlay, scale on hover

### Crossfader
- **Visual Gradient:** Red (Video 1) to Blue (Video 2)
- **Large Thumb:** Easy to grab and drag
- **Glow Effect:** Subtle shadow for depth
- **Responsive:** Works on mobile with touch

---

## 📱 Mobile Support

All features work on mobile devices:
- ✅ Touch-friendly search modal
- ✅ Tap to load videos
- ✅ Touch-drag crossfader
- ✅ Responsive layout
- ✅ Optimized for small screens

---

## 🔧 Technical Details

### Search Backend
- **PHP Backend:** Secure API key storage
- **YouTube Data API v3:** Official Google API
- **Invidious Option:** Privacy-respecting alternative
- **Fallback Instances:** Multiple Invidious servers
- **Error Handling:** Graceful failure with user feedback

### Video Playback
- **YouTube IFrame API:** Full programmatic control
- **Dual Players:** Independent player instances
- **Cue System:** Load without auto-playing
- **State Management:** Track player states

### Audio Mixing
- **Constant Power Panning:** Professional crossfading
- **Math.cos/sin:** Smooth volume curves
- **No Volume Dips:** Maintains perceived loudness
- **Real-time:** Instant response to fader changes

---

## 🆘 Common Questions

**Q: Can I load the same video in both decks?**  
A: Yes! Great for creating loops or comparing different parts.

**Q: Do I need to stop one video before playing another?**  
A: No! You can play both simultaneously and mix them.

**Q: Can I search while videos are playing?**  
A: Yes! Search doesn't interrupt playback.

**Q: What happens if I click "Load" while a video is playing?**  
A: The new video loads and cues (doesn't auto-play). Current video keeps playing.

**Q: Can I use this for live streaming?**  
A: Yes, if the YouTube video is a live stream, it will work!

---

## 🎯 Use Cases

### DJ Mixing
Mix music videos like a DJ with crossfading

### Video Comparison
Compare two videos side-by-side with audio control

### Mashups
Create audio/video mashups in real-time

### Education
Compare different performances or tutorials

### Entertainment
Mix your favorite videos for fun!

---

**Enjoy mixing! 🎵🎥**
