# Excalidraw Canvas Customization Guide

## ✅ Yes, You Can Customize Canvas Size and Toolbar!

You're **not stuck** with the default UI. Excalidraw provides extensive customization options through props and configuration.

## Available Customization Options

### 🎨 **Canvas Size & Dimensions**
- **Width**: Any CSS value (`100%`, `800px`, `90vw`)
- **Height**: Any CSS value (`600px`, `80vh`, `calc(100vh - 200px)`)
- **Responsive**: Automatically adapts to container

### 🛠️ **Toolbar & UI Controls**
- **Zen Mode**: Hide all UI for distraction-free drawing
- **Grid Mode**: Show/hide background grid
- **Export Options**: Enable/disable export dialogs
- **Theme Toggle**: Allow users to switch light/dark
- **Canvas Actions**: Control which menu items appear

### 📐 **Layout Configurations**
- **Fullscreen**: Canvas takes entire viewport
- **Centered**: Canvas with padding and borders
- **Sidebar**: Canvas with side panels for tools/pages
- **Minimal**: Clean interface with minimal UI

## Test Pages Available

### 1. **Custom Configuration** - `/test/workspace-custom`
- **Interactive controls** to adjust canvas size
- **Toggle features** like zen mode, grid, export options
- **Real-time configuration** changes

### 2. **Layout Presets** - `/test/workspace-layouts`
- **4 pre-built layouts**: Fullscreen, Centered, Sidebar, Minimal
- **Easy switching** between layouts
- **Different use cases** demonstrated

### 3. **Working Native** - `/test/workspace` 
- **Current working version** with native toolbar
- **Standard Excalidraw interface**

## Customization Examples

### **1. Compact Canvas**
```typescript
<ExcalidrawCanvasCustom
  width="800px"
  height="500px"
  zenMode={false}
  showExportDialog={true}
/>
```

### **2. Fullscreen Immersive**
```typescript
<ExcalidrawCanvasCustom
  width="100vw"
  height="100vh"
  zenMode={true}
  gridMode={false}
/>
```

### **3. Grid-Based Drawing**
```typescript
<ExcalidrawCanvasCustom
  width="90%"
  height="70vh"
  gridMode={true}
  showThemeToggle={true}
/>
```

### **4. Minimal Interface**
```typescript
<ExcalidrawCanvasCustom
  width="100%"
  height="600px"
  zenMode={true}
  showExportDialog={false}
  showThemeToggle={false}
/>
```

## UI Options Available

### **Canvas Actions** (Menu Items)
- `changeViewBackgroundColor` - Background color picker
- `clearCanvas` - Clear all button
- `export` - Export to image/file options
- `loadScene` - Load from file
- `saveToActiveFile` - Save options
- `toggleTheme` - Light/dark theme switch
- `saveAsImage` - Quick image export

### **Tool Options**
- `image` - Enable/disable image insertion
- Custom toolbar positioning
- Custom UI elements via `renderTopRightUI`

### **Mode Options**
- `zenModeEnabled` - Hide all UI except canvas
- `gridModeEnabled` - Show background grid
- `viewModeEnabled` - Read-only mode

## Container Layouts

### **Fullscreen Layout**
```css
height: calc(100vh - 120px);
width: 100%;
```

### **Centered Layout**  
```css
max-width: 1200px;
margin: 0 auto;
padding: 2rem;
```

### **Sidebar Layout**
```css
display: grid;
grid-template-columns: 250px 1fr 250px;
height: 100vh;
```

## Test URLs (localhost:4005)

| URL | Description |
|-----|-------------|
| `/test/workspace-custom` | **Interactive customization controls** |
| `/test/workspace-layouts` | **4 different layout presets** |
| `/test/workspace` | Current working native toolbar |
| `/test/workspace-native` | Alternative native implementation |

## Recommended Configurations

### **For Drawing/Art**
- Large canvas (90% width, 80vh height)
- Grid mode enabled
- Zen mode for focus
- Minimal export options

### **For Presentations**
- Standard size (800px × 600px)
- All export options enabled
- Theme toggle available
- Background color picker

### **For Note-taking**
- Full height (`calc(100vh - 150px)`)
- Grid mode enabled
- Quick export to image
- Side panels for organization

## Next Steps

1. **Visit** `/test/workspace-custom` to **experiment with different settings**
2. **Try** `/test/workspace-layouts` to **see different layout options**
3. **Choose your preferred configuration** and we can implement it
4. **Customize further** with specific requirements

## Bottom Line
✅ **You have full control over canvas size, toolbar visibility, layout, and features. Test the customization pages to find your ideal setup!**