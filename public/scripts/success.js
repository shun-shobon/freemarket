import { html, render, Fragment } from "./deps.js";

const App = () => {
  const item = window.DATA;

  return html`
    <linkdiv>
      <h1>出品登録</h1>
      <p>登録が完了しました。</p>

      <dl>
        <dt>商品名</dt>
        <dd>${item.name}</dd>

        <dt>出品日時</dt>
        <dd>${new Date(item.created_at).toLocaleString()}</dd>

        <dt>商品説明</dt>
        <dd>${item.description}</dd>

        ${
          item.image &&
          html`
            <${Fragment}>
              <dt>画像</dt>
              <dd><img src=${`/uploads/${item.image}`} /></dd>
            <//>
          `
        }
        ${
          item.deadline
            ? html`
                <${Fragment}>
                  <dt>譲渡先</dt>
                  <dd>抽選</dd>

                  <dt>期限</dt>
                  <dd>${new Date(item.deadline).toLocaleString()}</dd>
                <//>
              `
            : html`
                <${Fragment}>
                  <dt>譲渡先</dt>
                  <dd>早いもの勝ち</dd>
                <//>
              `
        }
      </dl>

      <a href="/">ホームへ</a>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
