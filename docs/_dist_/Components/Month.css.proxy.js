// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".month-container.svelte-ny3kda{width:100%;display:-ms-grid;display:grid;-ms-grid-columns:1fr;-ms-grid-rows:1fr}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';

  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}