import { html, render, useRef } from "./deps.js";
import { useData } from "./utils.js";

const App = () => {
  const { item } = useData();

  const formRef = useRef(null);
  const dialogRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    dialogRef.current.showModal();
  };
  const handleOk = () => {
    formRef.current.submit();
  };
  const handleCancel = () => {
    dialogRef.current.close();
  };

  return html`
    <main>
      <h1>${item.name}</h1>
      ${item.image && html`<img src=${`/uploads/${item.image}`} />`}
      <p>${item.description}</p>
      <form action="/bid" method="POST" ref=${formRef} onSubmit=${handleSubmit}>
        <input type="hidden" name="id" value=${item.id} />
        <input type="submit" value="応募する" />
      </form>
      <dialog ref=${dialogRef}>
        <header>応募確認</header>
        <p>応募しますか？</p>
        <menu>
          <button onClick=${handleOk}>応募</button>
          <button onClick=${handleCancel}>キャンセル</button>
        </menu>
      </dialog>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
