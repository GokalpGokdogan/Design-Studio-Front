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
      fontWeight: '500',
      fontSize: '16px',
      lineHeight: '1.5',
      padding: '12px 24px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      userSelect: 'none'
    },
    input: {
      boxSizing: 'border-box',
      width: '100%',
      border: '1px solid #d4d4d8',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '16px',
      lineHeight: '1.5',
      backgroundColor: '#ffffff',
      color: '#18181b',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e4e4e7',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  };

  const getButtonVariant = (variant = 'primary') => {
    const variants = {
      primary: {
        background: '#0284c7',
        color: 'white'
      },
      secondary: {
        background: '#f4f4f5',
        color: '#18181b',
        border: '1px solid #d4d4d8'
      },
      ghost: {
        background: 'transparent',
        color: '#0284c7'
      },
      destructive: {
        background: '#ef4444',
        color: 'white'
      }
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = (size = 'md') => {
    const sizes = {
      xs: { padding: '6px 12px', fontSize: '12px' },
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
      xl: { padding: '20px 40px', fontSize: '20px' }
    };
    return sizes[size] || sizes.md;
  };

  switch (role) {
    case "button":
      const buttonVariant = getButtonVariant(props.variant);
      const buttonSize = getSizeStyles(props.size);
      
      return (
        <button 
          style={{ 
            ...baseStyles.button,
            ...buttonVariant,
            ...buttonSize,
            ...styles,
            ...(props.fullWidth && { width: '100%' }),
            ...(props.disabled && { opacity: 0.6, cursor: 'not-allowed' }),
            ...(props.loading && { opacity: 0.8 })
          }}
          disabled={props.disabled || props.loading}
          type={props.type || 'button'}
        >
          {props.loading && (
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: content ? '8px' : 0
            }} />
          )}
          {props.icon && props.iconPosition !== 'right' && 
            <span style={{ marginRight: content ? '8px' : 0 }}>{props.icon}</span>
          }
          {content}
          {props.icon && props.iconPosition === 'right' && 
            <span style={{ marginLeft: content ? '8px' : 0 }}>{props.icon}</span>
          }
        </button>
      );

    case "input":
      return (
        <div style={{ width: '100%' }}>
          {props.label && (
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#18181b',
              marginBottom: '6px'
            }}>
              {props.label}
              {props.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
          )}
          <div style={{ position: 'relative' }}>
            {props.icon && (
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a1a1aa',
                pointerEvents: 'none'
              }}>
                {props.icon}
              </div>
            )}
            <input
              placeholder={props.placeholder}
              type={props.type || "text"}
              defaultValue={props.value || ""}
              disabled={props.disabled}
              style={{ 
                ...baseStyles.input,
                ...getSizeStyles(props.size),
                ...styles,
                ...(props.icon && { paddingLeft: '44px' }),
                ...(props.error && { 
                  borderColor: '#ef4444',
                  boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                })
              }}
              onFocus={(e) => {
                if (!props.error) {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d4d4d8';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {(props.helperText || props.error) && (
            <p style={{
              fontSize: '12px',
              color: props.error ? '#ef4444' : '#71717a',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {props.error ? 'This field is required' : props.helperText}
            </p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div style={{ width: '100%' }}>
          {props.label && (
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#18181b',
              marginBottom: '6px'
            }}>
              {props.label}
              {props.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
          )}
          <textarea
            placeholder={props.placeholder}
            defaultValue={props.value || ""}
            disabled={props.disabled}
            rows={props.rows || 4}
            style={{ 
              ...baseStyles.input,
              ...styles,
              resize: 'vertical',
              minHeight: '100px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      );

    case "hero":
      return (
        <section style={{
          padding: '80px 48px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #fafafa 100%)',
          ...styles
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {props.eyebrow && (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px'
              }}>
                {props.eyebrow}
              </div>
            )}
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              lineHeight: '1.1',
              color: '#18181b',
              margin: '0 0 24px 0',
              letterSpacing: '-0.02em'
            }}>
              {content}
            </h1>
            {props.subtitle && (
              <p style={{
                fontSize: '18px',
                color: '#71717a',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 48px auto'
              }}>
                {props.subtitle}
              </p>
            )}
          </div>
        </section>
      );

    case "stats":
      const itemCount = (props.items || []).length;
      return (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(itemCount, 4)}, 1fr)`,
          gap: '24px',
          ...styles 
        }}>
          {(props.items || []).map((item, index) => (
            <div key={index} style={{
              padding: '24px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e4e4e7',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800',
                color: '#0284c7',
                lineHeight: '1',
                marginBottom: '8px'
              }}>
                {item.value}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#71717a',
                fontWeight: '500'
              }}>
                {item.label}
              </div>
              {item.trend && (
                <div style={{
                  fontSize: '12px',
                  color: item.trend.startsWith('+') ? '#22c55e' : '#ef4444',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {item.trend}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "card":
    return (
        <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e4e4e7',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        ...styles,
        ...(props.shadow === false && { boxShadow: 'none' }),
        ...(props.bordered && { border: '2px solid #e4e4e7' })
        }}>
        {props.header && (
            <div style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e4e4e7'
            }}>
            <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#18181b'
            }}>
                {props.header}
            </h3>
            </div>
        )}
        
        {/* Card content area - this is where form elements would go */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {content && <div>{content}</div>}

        </div>
        
        {props.footer && (
            <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e4e4e7'
            }}>
            {props.footer}
            </div>
        )}
        </div>
    );
    case "table":
      return (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e4e4e7',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          ...styles
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {(props.headers || []).map((header, index) => (
                  <th key={index} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#18181b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(props.rows || []).map((row, rowIndex) => (
                <tr key={rowIndex} style={{ 
                  borderBottom: rowIndex < (props.rows.length - 1) ? '1px solid #e4e4e7' : 'none'
                }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: '16px 20px',
                      fontSize: '14px',
                      color: '#71717a'
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
      const badgeVariants = {
        default: { background: '#f4f4f5', color: '#27272a', border: '1px solid #d4d4d8' },
        primary: { background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' },
        success: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        warning: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
        error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }
      };
      
      const badgeSize = getSizeStyles(props.size || 'sm');
      const badgeVariant = badgeVariants[props.variant || 'default'];
      
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '9999px',
          fontWeight: '500',
          ...badgeVariant,
          ...badgeSize,
          ...styles
        }}>
          {props.icon && <span style={{ marginRight: '4px' }}>{props.icon}</span>}
          {content}
        </span>
      );

    // Fallback for basic components
    case "heading": {
      const Tag = `h${props.level || 1}`;
      const sizes = {
        1: '36px',
        2: '30px', 
        3: '24px',
        4: '20px',
        5: '18px',
        6: '16px'
      };
      
      return (
        <Tag style={{
          fontSize: sizes[props.level || 1],
          fontWeight: '600',
          lineHeight: '1.2',
          color: '#18181b',
          margin: 0,
          ...styles
        }}>
          {content}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#71717a',
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
          backgroundColor: '#f4f4f5',
          borderRadius: '8px',
          minHeight: '200px',
          border: '2px dashed #d4d4d8',
          ...styles
        }}>
          <div style={{ textAlign: 'center', color: '#a1a1aa' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
            <span style={{ fontSize: '14px' }}>
              {props.alt || "Image placeholder"}
            </span>
          </div>
        </div>
      );

    // Handle unknown components
    default:
      return (
        <div style={{
          padding: '16px',
          border: '2px dashed #d4d4d8',
          borderRadius: '8px',
          background: '#fafafa',
          textAlign: 'center',
          ...styles
        }}>
          <span style={{ 
            color: '#a1a1aa', 
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {role}: {content || 'Component'}
          </span>
        </div>
      );
  }
};

export default ComponentNode;