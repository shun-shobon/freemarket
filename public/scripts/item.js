import { html, render, useRef, Fragment } from "./deps.js";
import { useData, useUser } from "./utils.js";

// 応募フォーム
const BidFrom = ({ item }) => {
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
    <${Fragment}>
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
    <//>
  `;
};

// 応募一覧
const BidList = ({ bids }) => {
  return html`
    <${Fragment}>
      <h2>応募一覧</h2>
      <table>
        <thead>
          <tr>
            <th>ユーザー名</th>
            <th>日時</th>
          </tr>
        </thead>
        <tbody>
          ${bids.map(
            (bid) => html`
              <tr key=${bid.id}>
                <td>${bid.user_name}</td>
                <td>${new Date(bid.created_at).toLocaleString()}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    <//>
  `;
};

const DeleteItem = ({ itemId }) => {
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
    <${Fragment}>
      <form
        action="/delete"
        method="POST"
        ref=${formRef}
        onSubmit="${handleSubmit}"
      >
        <input type="hidden" name="id" value=${itemId} />
        <input type="submit" value="削除" />
      </form>
      <dialog ref=${dialogRef}>
        <header>削除確認</header>
        <p>削除しますか？</p>
        <menu>
          <button onClick=${() => handleOk()}>削除</button>
          <button onClick=${() => handleCancel()}>キャンセル</button>
        </menu>
      </dialog>
    <//>
  `;
};

const App = () => {
  // 賞品情報と応募一覧を取得
  const { item, bids } = useData();
  const user = useUser();

  return html`
    <main>
      <h1>${item.name}</h1>
      ${item.image && html`<img src=${`/uploads/${item.image}`} />`}
      <p>${item.description}</p>
      ${
        // 応募一覧があれば表示、なければ応募フォームを表示
        bids
          ? html`<${BidList} bids=${bids} />`
          : html`<${BidFrom} item=${item} />`
      }
      ${item.user_id === user.id && html`<${DeleteItem} itemId=${item.id} />`}
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
