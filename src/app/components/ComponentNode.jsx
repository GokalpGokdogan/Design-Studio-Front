import { resolveStyles } from "./LayoutNode";

const ComponentNode = ({ component }) => {
  const { role, content, props = {}, style = {} } = component;
  const styles = resolveStyles(style);

  switch (role) {
    case "heading": {
      const Tag = `h${props.level || 1}`;
      return <Tag style={styles}>{content}</Tag>;
    }
    case "paragraph":
      return <p style={styles}>{content}</p>;
    case "button":
      return (
        <button style={{ ...styles, border: "none", cursor: "pointer" }}>
          {content}
        </button>
      );
    case "input":
      return (
        <input
          placeholder={props.placeholder}
          style={{
            ...styles,
            boxSizing: "border-box",
            width: "100%",
            border: "1px solid var(--color-neutral-200, #e5e7eb)"
          }}
          readOnly
        />
      );
    case "image":
      return (
        <div
          style={{
            ...styles,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5e7eb"
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            {props.alt || "Image"}
          </span>
        </div>
      );
    case "img": {
      // Real <img> with basic props
      const fit = props.fit || "cover"; // cover | contain | fill | none | scale-down
      const width = props.width ?? "100%";
      const height = props.height ?? "200px";
      return (
        <img
          src={props.src}
          alt={props.alt || ""}
          style={{
            ...styles,
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
            objectFit: fit,
            display: "block"
          }}
          loading="lazy"
        />
      );
    };

    case "svg": {
      // Inline SVG: either raw string via props.svg, or build from props.paths
      const { svg, viewBox = "0 0 24 24", width, height, paths = [] } = props || {};
      const w = width ?? 24;
      const h = height ?? 24;

      if (svg) {
        // If you pass a full <svg ...>...</svg> string, render it directly.
        return (
          <div
            style={{ ...styles, lineHeight: 0, display: "inline-block" }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        );
      }

      // Otherwise build a simple svg from path data
      return (
        <svg
          viewBox={viewBox}
          width={typeof w === "number" ? `${w}px` : w}
          height={typeof h === "number" ? `${h}px` : h}
          style={{ ...styles, display: "inline-block" }}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={props.alt || ""}
        >
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={p.fill ?? "currentColor"}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              fillRule={p.fillRule}
              clipRule={p.clipRule}
            />
          ))}
        </svg>
      );
    }
    case "card":
      return <div style={{ ...styles, border: "1px solid #e5e7eb" }}>{content}</div>;
    case "divider":
      return (
        <hr
          style={{
            ...styles,
            border: "none",
            borderTop: "1px solid #e5e7eb",
            height: "1px"
          }}
        />
      );
    default:
      return (
        <div
          style={{
            ...styles,
            border: "1px dashed #9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "12px" }}>{role}</span>
        </div>
      );
  }
};

export default ComponentNode;
