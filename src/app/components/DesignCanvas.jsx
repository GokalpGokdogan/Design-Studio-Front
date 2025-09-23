'use client';

import LayoutNode from "./LayoutNode";

const createTokenStyles = (tokens) => {
  if (!tokens) return '';
  const variables = [];
  for (const [key, token] of Object.entries(tokens.color || {})) {
    variables.push(`--color-${key}: ${token.value};`);
  }
  for (const [key, typo] of Object.entries(tokens.typography || {})) {
    variables.push(`--font-${key}-family: ${typo.fontFamily};`);
    variables.push(`--font-${key}-weight: ${typo.fontWeight};`);
    variables.push(`--font-${key}-size: ${typo.fontSize}px;`);
    variables.push(`--font-${key}-line-height: ${typo.lineHeight};`);
  }
  for (const [key, value] of Object.entries(tokens.spacing || {})) {
    variables.push(`--spacing-${key}: ${value}px;`);
  }
  for (const [key, value] of Object.entries(tokens.borderRadius || {})) {
    variables.push(`--radius-${key}: ${value}px;`);
  }
  return `:root { ${variables.join(' ')} }`;
};

const DesignCanvas = ({ designData }) => {
  if (!designData || !designData.artboard) {
    return (
      <div className="flex h-[720px] items-center justify-center text-sm text-slate-500">
        Enter a prompt and click Generate to see a design.
      </div>
    );
  }
  console.log(designData)
  const { figmaTokens, artboard, tree, floating = [] } = designData;
  const tokenStyleString = createTokenStyles(figmaTokens);

  return (
    <>
      <style>{tokenStyleString}</style>
      <div
        className="relative mx-auto my-8 shadow-lg overflow-hidden"
        style={{
          width: `${artboard.width}px`,
          height: `${artboard.height}px`,
          backgroundColor: artboard.background
        }}
      >
        {/* Main tree */}
        <div className="absolute inset-0 p-4 box-border">
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
            pointerEvents: "auto"
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
