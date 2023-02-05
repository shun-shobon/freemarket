import { html, render, Fragment } from "./deps.js";
import { useData } from "./utils.js";

const App = () => {
  const item = useData();

  return html`
    <main class="container vstack">
      <h1>出品登録</h1>
      <p>登録が完了しました。</p>

      <dl class="table">
        <div>
          <dt>商品名</dt>
          <dd>${item.name}</dd>
        </div>

        <div>
          <dt>出品日時</dt>
          <dd>${new Date(item.created_at).toLocaleString()}</dd>
        </div>

        <div>
          <dt>商品説明</dt>
          <dd>${item.description}</dd>
        </div>

        ${item.image &&
        html`
          <div>
            <dt>画像</dt>
            <dd><img src=${`/uploads/${item.image}`} /></dd>
          </div>
        `}
        ${item.deadline
          ? html`
              <div>
                <dt>譲渡先</dt>
                <dd>抽選</dd>

                <dt>期限</dt>
                <dd>${new Date(item.deadline).toLocaleString()}</dd>
              </div>
            `
          : html`
              <div>
                <dt>譲渡先</dt>
                <dd>早いもの勝ち</dd>
              </div>
            `}
      </dl>

      <div>
        <a class="button" href="/">ホームへ</a>
      </div>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
