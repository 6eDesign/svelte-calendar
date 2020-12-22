// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "h1.svelte-xfd0k7{text-align:center;margin:100px 0}.container.svelte-xfd0k7{background:#eee;padding:15px;max-width:100%;width:800px;margin:0 auto}.custom-button.svelte-xfd0k7{display:inline-block;background:rgb(0, 120, 255);color:#eee;border:1px solid rgb(0, 100, 255);text-align:center;padding:15px 30px;cursor:pointer}.text-center.svelte-xfd0k7{text-align:center}.note.svelte-xfd0k7{color:tomato}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';

  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}