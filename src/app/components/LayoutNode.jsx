import ComponentNode from "./ComponentNode";

/** Convert token-y style object into real CSS inline styles */
export const resolveStyles = (style) => {
  if (!style) return {};
  const resolved = {};
  for (const [key, value] of Object.entries(style)) {
    switch (key) {
      case "font":
        resolved.fontFamily = `var(--font-${value}-family)`;
        resolved.fontWeight = `var(--font-${value}-weight)`;
        resolved.fontSize = `var(--font-${value}-size)`;
        resolved.lineHeight = `var(--font-${value}-line-height)`;
        break;
      case "radius":
        resolved.borderRadius =
          typeof value === "number" ? `${value}px` : `var(--radius-${value})`;
        break;
        
      case "rounded": {
        if (value === false) {
            resolved.borderRadius = "0px";
        } else if (value === true) {
            resolved.borderRadius = "var(--radius-md, 8px)";
        } else if (typeof value === "number") {
            resolved.borderRadius = `${value}px`;
        } else {
            resolved.borderRadius = `var(--radius-${value}, 8px)`; // e.g. "sm" | "lg" | "pill"
        }
        break;
    }
      case "padding":
      case "margin":
      case "marginTop":
      case "marginRight":
      case "marginBottom":
      case "marginLeft":
      case "gap":
        resolved[key] =
          typeof value === "number"
            ? `${value}px`
            : `var(--spacing-${value}, ${value}px)`;
        break;
      case "background":
        resolved.backgroundColor = value;
        break;
      default:
        resolved[key] = value;
        break;
    }
  }
  return resolved;
};

const spacingToCss = (val) =>
  typeof val === "number" ? `${val}px` : `var(--spacing-${val}, ${val}px)`;

/** Render the DSL node recursively */
const LayoutNode = ({ node }) => {
  if (!node) return null;

  // Leaf component
  if (node.type === "component") {
    return <ComponentNode component={node} />;
  }

  // Container: row / stack / grid / box
  const containerStyle = {
    ...resolveStyles(node.style || {}),
  };

  // Map generic layout props -> CSS
  if (node.padding != null) containerStyle.padding = spacingToCss(node.padding);
  if (node.gap != null) containerStyle.gap = spacingToCss(node.gap);

  if (node.type === "row" || node.type === "stack") {
    containerStyle.display = "flex";
    containerStyle.flexDirection =
      node.type === "row"
        ? "row"
        : node.direction === "row"
        ? "row"
        : "column";

    // align-items / justify-content from tokens
    const alignMap = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
    const justifyMap = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };
    if (node.align) containerStyle.alignItems = alignMap[node.align] || node.align;
    if (node.justify) containerStyle.justifyContent = justifyMap[node.justify] || node.justify;
  }

  if (node.type === "grid") {
    containerStyle.display = "grid";
    const cols = node.cols?.base || 1;
    containerStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    // NOTE: For md/lg, you can inject a <style> tag with media queries if desired.
  }

  const kids = Array.isArray(node.children) ? node.children : [];

  return (
    <div style={containerStyle}>
      {kids.map((child, idx) => (
        <LayoutNode key={idx} node={child} />
      ))}
    </div>
  );
};

export default LayoutNode;
