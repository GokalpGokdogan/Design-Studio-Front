'use client';

import LayoutNode from "./LayoutNode";

const createTokenStyles = (tokens) => {
  if (!tokens) return '';
  
  const variables = [];
  
  // Handle color tokens correctly
  for (const [key, token] of Object.entries(tokens.color || {})) {
    if (token && token.value) {
      variables.push(`--color-${key}: ${token.value};`);
    }
  }
  
  // Handle typography tokens
  for (const [key, typo] of Object.entries(tokens.typography || {})) {
    if (typo) {
      if (typo.fontFamily) variables.push(`--font-${key}-family: ${typo.fontFamily};`);
      if (typo.fontWeight) variables.push(`--font-${key}-weight: ${typo.fontWeight};`);
      if (typo.fontSize) variables.push(`--font-${key}-size: ${typo.fontSize}px;`);
      if (typo.lineHeight) variables.push(`--font-${key}-line-height: ${typo.lineHeight};`);
      if (typo.letterSpacing) {
        variables.push(`--font-${key}-letter-spacing: ${typo.letterSpacing};`);
      }
    }
  }
  
  // Handle spacing tokens
  for (const [key, value] of Object.entries(tokens.spacing || {})) {
    variables.push(`--spacing-${key}: ${value}px;`);
  }
  
  // Handle borderRadius tokens
  for (const [key, value] of Object.entries(tokens.borderRadius || {})) {
    if (value === 9999) {
      variables.push(`--radius-${key}: 9999px;`);
    } else {
      variables.push(`--radius-${key}: ${value}px;`);
    }
  }
  
  // Handle shadow tokens
  for (const [key, value] of Object.entries(tokens.shadow || {})) {
    variables.push(`--shadow-${key}: ${value};`);
  }
  
  const globalStyles = `
    * {
      box-sizing: border-box;
    }
    
    body, html {
      font-family: var(--font-body-family, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    button, input, textarea, select {
      font-family: inherit;
    }
    
    button:hover {
      transform: translateY(-1px);
    }
    
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--color-primary-500, #0ea5e9);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `;
  
  return `:root { ${variables.join(' ')} } ${globalStyles}`;
};

const DesignCanvas = ({ designData }) => {
  if (!designData || !designData.artboard) {
    return (
      <div className="flex h-[720px] items-center justify-center text-sm text-slate-500">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p>Enter a prompt and click Generate to create a stunning design.</p>
          <p className="text-xs mt-2 opacity-60">Try: "modern dashboard", "login page", "pricing section"</p>
        </div>
      </div>
    );
  }

  const { figmaTokens, artboard, tree, floating = [] } = designData;
  const tokenStyleString = createTokenStyles(figmaTokens);


  return (
    <>
      <style>{tokenStyleString}</style>
      <div
        className="relative mx-auto my-8 shadow-2xl overflow-auto animate-fade-in bg-white"
        style={{
          width: '100%',
          maxWidth: `${Math.min(artboard.width, 1200)}px`,
          height: 'auto',
          minHeight: '400px',
          backgroundColor: artboard.background || 'var(--color-neutral-50, #ffffff)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--color-neutral-200, #e4e4e7)',
        }}
      >
        {/* Main content */}
        <div style={{ 
          width: '100%', 
          minHeight: '400px',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <LayoutNode node={tree} />
        </div>

        {/* Floating overlays */}
        {floating.map((item, idx) => {
          const pos = item.position || {};
          const style = {
            position: "absolute",
            ...(pos.top != null ? { top: `${pos.top}px` } : {}),
            ...(pos.left != null ? { left: `${pos.left}px` } : {}),
            ...(pos.right != null ? { right: `${pos.right}px` } : {}),
            ...(pos.bottom != null ? { bottom: `${pos.bottom}px` } : {}),
            pointerEvents: "auto",
            zIndex: 1000 + idx
          };
          return (
            <div key={idx} style={style}>
              <LayoutNode node={item.node || item} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DesignCanvas;