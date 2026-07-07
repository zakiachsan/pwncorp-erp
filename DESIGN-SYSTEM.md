# PWN Corp ERP — Design System Reference

## Brand
- Primary: `#0176d3` (blue)
- Secondary: `#032d47` (dark navy)
- Success: `#2e844a` (green)
- Error: `#ea001e` (red)
- Warning: `#fe9339` (orange)
- Purple: `#8b5cf6`
- Amber: `#f59e0b`

## Typography
- No Tailwind CSS — use inline `style` objects
- Colors: `#001526` (text primary), `#444746` (text secondary), `#8e8f8e` (text muted)
- Font sizes: 10-11px labels/captions, 13px body, 14-15px headers, 18-20px card values

## CSS Utility Classes (globals.css)
### Layout
- `view-header` — page header with title + action buttons
- `view-title` — title text in header
- `filter-section` — filter area container
- `card-slds` — white card with border/shadow
- `table-wrap` — bordered table container with border-radius
- `data-table` — table styles (headers, rows, zebra optional)
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4` — responsive grid

### Form
- `form-group` — form field wrapper
- `form-label` — label style (11px, #444746, uppercase-ish)
- `form-input` — text input
- `form-select` — select dropdown
- `btn btn--brand btn--sm` — primary button (blue)
- `btn btn--sm` — secondary button (white outline)
- `pill` — inline pill/badge

## Component Patterns
### Page Structure
```tsx
<div>
  <div className="view-header">
    <div className="view-title"><Icon /> Title</div>
    <button className="btn btn--brand btn--sm"><Plus size={14} /> Action</button>
  </div>
  <div className="filter-section">...</div>
  <div className="table-wrap">
    <table className="data-table">...</table>
  </div>
</div>
```

### Summary Cards
```tsx
<div className="card-slds" style={{ padding: "14px 16px" }}>
  <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">LABEL</div>
  <div style={{ fontSize: 20, fontWeight: 700, color: "#0176d3" }}>Rp 45.000.000</div>
</div>
```

### Tables
- Use `data-table` class, headers uppercase 11px #444746
- Zebra striping: `background: i % 2 === 0 ? "#fff" : "#f9fafb"`
- Clickable rows: `cursor: "pointer"`, blue links for document numbers
- Status pills: `display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff"`

### Tabs
Two styles:
1. **Pill tabs**: `background: "#ecebea", borderRadius: 8, padding: 3` wrapper, buttons `borderRadius: 6`
2. **Underline tabs**: `borderBottom: "2px solid #ecebea"` wrapper, active tab gets `borderBottom: "2px solid #0176d3"`

### Modals
```tsx
<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
  <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%" }}>
    <h3>Title</h3>
    <p>Message</p>
    <button>Batal</button>
    <button style={{ background: "#0176d3", color: "#fff" }}>Confirm</button>
  </div>
</div>
```

### 3-Column Info Cards (Detail Pages)
```tsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
  <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginBottom: 8 }}>SECTION TITLE</div>
    {/* F2 compact fields */}
  </div>
</div>
```

### Compact Field (F2)
```tsx
<div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
  <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>LABEL</span>
  <span style={{ fontSize: 12, fontWeight: 500, color: "#001526" }}>VALUE</span>
</div>
```

## No-Nos
- No Tailwind CSS
- No `className` for styling (only for layout utilities from globals.css)
- All custom styles use inline `style={{}}` objects
- No external component libraries (MUI, Chakra, etc.)
- No dark mode
- Color values: always use hex (`#0176d3`), not CSS vars unless from globals.css
