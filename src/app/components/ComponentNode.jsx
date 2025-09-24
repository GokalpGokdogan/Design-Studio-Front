import { resolveStyles } from "./LayoutNode";

const ComponentNode = ({ component }) => {
  const { role, content, props = {}, style = {} } = component;
  const styles = resolveStyles(style);

  const baseStyles = {
    button: {
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--font-button-weight, 500)',
      fontSize: 'var(--font-button-size, 14px)',
      lineHeight: 'var(--font-button-line-height, 20px)',
      padding: 'var(--spacing-button-y, 8px) var(--spacing-button-x, 16px)',
      borderRadius: 'var(--radius-button, 6px)',
      transition: 'all 0.2s ease',
    },
    input: {
      boxSizing: 'border-box',
      width: '100%',
      border: '1px solid var(--color-border-input, #e5e7eb)',
      borderRadius: 'var(--radius-input, 6px)',
      padding: 'var(--spacing-input-y, 8px) var(--spacing-input-x, 12px)',
      fontSize: 'var(--font-body-size, 14px)',
    },
    card: {
      background: 'var(--color-background-card, white)',
      borderRadius: 'var(--radius-card, 8px)',
      border: '1px solid var(--color-border-card, #f3f4f6)',
      padding: 'var(--spacing-card, 16px)',
    }
  };

  switch (role) {
    case "button":
      return (
        <button 
          style={{ 
            ...baseStyles.button, 
            ...styles,
            // Allow props to override styles
            ...(props.variant === 'ghost' && {
              background: 'transparent',
              border: '1px solid var(--color-border-button, #e5e7eb)'
            }),
            ...(props.variant === 'secondary' && {
              background: 'var(--color-button-secondary, #f3f4f6)',
              color: 'var(--color-button-secondary-text, #374151)'
            })
          }}
          // Pass through other HTML button props
          disabled={props.disabled}
          type={props.type}
        >
          {content}
          {props.icon && <span style={{ marginLeft: '8px' }}>{props.icon}</span>}
        </button>
      );

case "input":
  return (
    <input
      placeholder={props.placeholder}
      type={props.type || "text"}
      defaultValue={props.value || ""}
      style={{ 
        // Remove hardcoded styles and rely on resolved styles
        ...styles,
        boxSizing: 'border-box',
        width: '100%'
      }}
    />
  );

    case "stats":
      return (
        <div style={{ display: 'flex', gap: 'var(--spacing-stats-gap, 16px)', ...styles }}>
          {(props.items || []).map((item, index) => (
            <div key={index} style={{
              flex: 1,
              padding: 'var(--spacing-stats-item, 20px)',
              background: 'var(--color-background-stats, white)',
              borderRadius: 'var(--radius-stats, 12px)',
              boxShadow: props.shadow ? 'var(--shadow-stats, 0 1px 3px rgba(0,0,0,0.1))' : 'none'
            }}>
              <div style={{ 
                fontSize: 'var(--font-stats-value-size, 24px)', 
                fontWeight: 'var(--font-stats-value-weight, 700)',
                color: 'var(--color-stats-value, #1f2937)'
              }}>
                {item.value}
              </div>
              <div style={{ 
                fontSize: 'var(--font-stats-label-size, 14px)', 
                color: 'var(--color-stats-label, #6b7280)',
                marginTop: 'var(--spacing-stats-label, 4px)'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      );

    case "metric":
      return (
        <div style={{ 
          padding: 'var(--spacing-metric, 16px)',
          background: 'var(--color-background-metric, white)',
          borderRadius: 'var(--radius-metric, 8px)',
          border: props.bordered ? '1px solid var(--color-border-metric, #e5e7eb)' : 'none',
          ...styles 
        }}>
          <div style={{ 
            fontSize: 'var(--font-metric-value-size, 28px)', 
            fontWeight: 'var(--font-metric-value-weight, 700)',
            color: 'var(--color-metric-value, #1f2937)'
          }}>
            {props.value}
          </div>
          <div style={{ 
            fontSize: 'var(--font-metric-label-size, 14px)', 
            color: 'var(--color-metric-label, #6b7280)'
          }}>
            {props.label}
          </div>
        </div>
      );

    case "table":
      return (
        <div style={{
          background: 'var(--color-background-table, white)',
          borderRadius: 'var(--radius-table, 8px)',
          overflow: 'hidden',
          boxShadow: props.shadow ? 'var(--shadow-table, 0 1px 3px rgba(0,0,0,0.1))' : 'none',
          ...styles
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-table-header, #f9fafb)' }}>
                {(props.headers || []).map((header, index) => (
                  <th key={index} style={{
                    padding: 'var(--spacing-table-cell, 12px 16px)',
                    textAlign: 'left',
                    fontSize: 'var(--font-table-header-size, 14px)',
                    fontWeight: 'var(--font-table-header-weight, 600)',
                    color: 'var(--color-table-header, #374151)',
                    borderBottom: '1px solid var(--color-border-table, #e5e7eb)'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(props.rows || []).map((row, rowIndex) => (
                <tr key={rowIndex} style={{ 
                  borderBottom: rowIndex < (props.rows.length - 1) ? '1px solid var(--color-border-table-row, #f3f4f6)' : 'none'
                }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: 'var(--spacing-table-cell, 12px 16px)',
                      fontSize: 'var(--font-table-cell-size, 14px)',
                      color: 'var(--color-table-cell, #6b7280)'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "badge":
      const variantStyles = {
        default: { background: 'var(--color-badge-default, #f3f4f6)', color: 'var(--color-badge-default-text, #374151)' },
        success: { background: 'var(--color-badge-success, #d1fae5)', color: 'var(--color-badge-success-text, #065f46)' },
        error: { background: 'var(--color-badge-error, #fee2e2)', color: 'var(--color-badge-error-text, #991b1b)' },
        warning: { background: 'var(--color-badge-warning, #fef3c7)', color: 'var(--color-badge-warning-text, #92400e)' },
        primary: { background: 'var(--color-badge-primary, #e0e7ff)', color: 'var(--color-badge-primary-text, #3730a3)' }
      };
      
      const sizeStyles = {
        sm: { padding: 'var(--spacing-badge-sm, 2px 8px)', fontSize: 'var(--font-badge-sm, 12px)' },
        md: { padding: 'var(--spacing-badge-md, 4px 12px)', fontSize: 'var(--font-badge-md, 14px)' },
        lg: { padding: 'var(--spacing-badge-lg, 6px 16px)', fontSize: 'var(--font-badge-lg, 14px)' }
      };
      
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 'var(--radius-badge, 9999px)',
          fontWeight: 'var(--font-badge-weight, 500)',
          ...variantStyles[props.variant || 'default'],
          ...sizeStyles[props.size || 'md'],
          ...styles
        }}>
          {content}
        </span>
      );

    // Keep basic components flexible
    case "heading": {
      const Tag = `h${props.level || 1}`;
      const headingStyles = {
        fontWeight: 'var(--font-heading-weight, 600)',
        lineHeight: 'var(--font-heading-line-height, 1.2)',
        color: 'var(--color-heading, #1f2937)',
        margin: 0,
        ...styles
      };
      return <Tag style={headingStyles}>{content}</Tag>;
    }

    case "paragraph":
      return (
        <p style={{
          lineHeight: 'var(--font-body-line-height, 1.5)',
          color: 'var(--color-text, #6b7280)',
          margin: 0,
          ...styles
        }}>
          {content}
        </p>
      );

    case "image":
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-image-background, #e5e7eb)',
          borderRadius: 'var(--radius-image, 8px)',
          ...styles
        }}>
          <span style={{ color: 'var(--color-image-placeholder, #6b7280)', fontSize: '14px' }}>
            {props.alt || "Image"}
          </span>
        </div>
      );

    case "card":
      return (
        <div style={{
          background: 'var(--color-background-card, white)',
          borderRadius: 'var(--radius-card, 8px)',
          border: '1px solid var(--color-border-card, #e5e7eb)',
          padding: 'var(--spacing-card, 16px)',
          ...styles
        }}>
          {content}
        </div>
      );

    default:
      return (
        <div style={{
          padding: 'var(--spacing-default, 16px)',
          border: '1px dashed var(--color-border-unknown, #9ca3af)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-default, 4px)',
          ...styles
        }}>
          <span style={{ color: 'var(--color-text-unknown, #6b7280)', fontSize: '12px' }}>
            {role}: {content}
          </span>
        </div>
      );
  }
};

export default ComponentNode;