import ComponentNode from "./ComponentNode";

export const resolveStyles = (style) => {
  if (!style) return {};
  const resolved = {};
  
  for (const [key, value] of Object.entries(style)) {
    switch (key) {
      case "font":
        resolved.fontFamily = `var(--font-${value}-family, Inter, sans-serif)`;
        resolved.fontWeight = `var(--font-${value}-weight, 400)`;
        resolved.fontSize = `var(--font-${value}-size, 16px)`;
        resolved.lineHeight = `var(--font-${value}-line-height, 1.5)`;
        break;
        
      case "radius":
      case "borderRadius":
        if (typeof value === "number") {
          resolved.borderRadius = `${value}px`;
        } else {
          resolved.borderRadius = `var(--radius-${value}, 8px)`;
        }
        break;
        
      case "rounded":
        if (value === false) {
          resolved.borderRadius = "0px";
        } else if (value === true) {
          resolved.borderRadius = "var(--radius-md, 8px)";
        } else if (typeof value === "number") {
          resolved.borderRadius = `${value}px`;
        } else {
          resolved.borderRadius = `var(--radius-${value}, 8px)`;
        }
        break;
      
      case "padding":
      case "margin":
      case "marginTop":
      case "marginRight":
      case "marginBottom":
      case "marginLeft":
      case "paddingTop":
      case "paddingRight":
      case "paddingBottom":
      case "paddingLeft":
      case "gap":
        if (typeof value === "number") {
          resolved[key] = `${value}px`;
        } else {
          resolved[key] = `var(--spacing-${value}, 16px)`;
        }
        break;
        
      case "background":
      case "backgroundColor":
        if (typeof value === 'string' && value.startsWith('#')) {
          resolved.backgroundColor = value;
        } else {
          resolved.backgroundColor = `var(--color-${value}, ${value})`;
        }
        break;
        
      case "color":
        if (typeof value === 'string' && value.startsWith('#')) {
          resolved.color = value;
        } else {
          resolved.color = `var(--color-${value}, ${value})`;
        }
        print(resolved.color)
        break;
        
      case "shadow":
        resolved.boxShadow = `var(--shadow-${value}, none)`;
        break;
        
      default:
        resolved[key] = value;
        break;
    }
  }
  return resolved;
};
const spacingToCss = (val) =>
  typeof val === "number" ? `${val}px` : `var(--spacing-${val}, 16px)`;

const LayoutNode = ({ node }) => {
  if (!node) return null;

  if (node.type === "component") {
    return <ComponentNode component={node} />;
  }

  const containerStyle = {
    ...resolveStyles(node.style || {}),
  };

  if (node.padding != null) containerStyle.padding = spacingToCss(node.padding);
  if (node.margin != null) containerStyle.margin = spacingToCss(node.margin);
  if (node.gap != null) containerStyle.gap = spacingToCss(node.gap);


  switch (node.type) {
    case "stack":
      containerStyle.display = "flex";
      containerStyle.flexDirection = node.direction === "row" ? "row" : "column";
      
      const alignMap = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
      const justifyMap = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };
      
      if (node.align) containerStyle.alignItems = alignMap[node.align] || node.align;
      if (node.justify) containerStyle.justifyContent = justifyMap[node.justify] || node.justify;
      break;

    case "row":
      containerStyle.display = "flex";
      containerStyle.flexDirection = "row";
      
      if (node.align) containerStyle.alignItems = alignMap[node.align] || node.align;
      if (node.justify) containerStyle.justifyContent = justifyMap[node.justify] || node.justify;
      break;

    case "grid":
      containerStyle.display = "grid";
      const cols = node.cols?.base || 1;
      containerStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      break;

    case "section":
      containerStyle.display = "block";
      if (node.maxWidth) {
        containerStyle.maxWidth = typeof node.maxWidth === "number" ? `${node.maxWidth}px` : node.maxWidth;
      }
      if (node.centered !== false) {
        containerStyle.margin = containerStyle.margin || "0 auto";
      }

      if (!containerStyle.padding && !node.padding) {
        containerStyle.padding = spacingToCss("xl");
      }
      break;

    case "box":
    default:
      containerStyle.display = "block";
      break;
  }


  const children = Array.isArray(node.children) ? node.children : [];
  
  return (
    <div style={containerStyle}>
      {children.map((child, idx) => (
        <LayoutNode key={idx} node={child} />
      ))}
    </div>
  );
};

export default LayoutNode;