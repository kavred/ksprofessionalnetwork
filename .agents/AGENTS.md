# Agent Rules

## Viewport Unit Execution Constraint
- **Constraint**: All coordinate-based browser interaction commands, styling commands, and position calculations must be executed in viewport units (such as `vw`, `vh`, `vmin`, `vmax`, `svw`, `svh`, `dvw`, `dvh`) rather than absolute pixel values (`px`).
- **Browser Automation**: When executing mouse clicks, scrolls, or dragging commands via browser subagents or scripts, coordinates must be mapped to viewport percentages or viewport units to maintain viewport independence.
- **CSS and Layouts**: When defining layout or position changes, use viewport units (`vw`, `vh`, `dvh`, etc.) to keep element sizing relative to the viewport size.
