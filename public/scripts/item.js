import { html, render, useRef, useState, Fragment } from "./deps.js";
import { useData, useUser } from "./utils.js";
import { Modal } from "./components.js";

// 応募フォーム
const BidFrom = ({ item }) => {
  const formRef = useRef(null);
  const [show, setShow] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setShow(true);
  };

  return html`
    <${Fragment}>
      <form action="/bid" method="POST" ref=${formRef} onSubmit=${handleSubmit}>
        <input type="hidden" name="id" value=${item.id} />
        <input type="submit" value="応募する" />
      </form>
      <${Modal} show=${show}>
        <header>応募確認</header>
        <p>応募しますか？</p>
        <menu>
          <button onClick=${() => formRef.current.submit()}>応募</button>
          <button onClick=${() => setShow(false)}>キャンセル</button>
        </menu>
      <//>
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
  const [show, setShow] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setShow(true);
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
      <${Modal} show=${show}>
        <header>削除確認</header>
        <p>削除しますか？</p>
        <menu>
          <button onClick=${() => formRef.current.submit()}>削除</button>
          <button onClick=${() => setShow(false)}>キャンセル</button>
        </menu>
      <//>
    <//>
  `;
};

const App = () => {
  // 賞品情報と応募一覧を取得
  const { item, bids } = useData();
  const user = useUser();

  return html`
    <main class="container two-column">
      ${item.image
        ? html`<img class="item-page__image" src=${`/uploads/${item.image}`} />`
        : html`<div class="item-page__image" />`}
      <div class="item-page__attributes">
        <h1 class="item-page__attributes__name">${item.name}</h1>
        <h2>商品の説明</h2>
        <p class="item-page__attributes__description">${item.description}</p>
        ${
          // 応募一覧があれば表示、なければ応募フォームを表示
          bids
            ? html`<${BidList} bids=${bids} />`
            : html`<${BidFrom} item=${item} />`
        }
        ${
          // ログインしていて、かつ自分の投稿であれば削除ボタンを表示
          item.user_id === user?.id && html`<${DeleteItem} itemId=${item.id} />`
        }
      </div>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
