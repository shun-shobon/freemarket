import { html, render, Fragment } from "./deps.js";
import { useUser } from "./utils.js";

const App = () => {
  const user = useUser();

  return html`
    <${Fragment}>
      <div>${user ? `ユーザー名: ${user.name}` : "未ログイン"}</div>
      <nav>
        <ul>
          ${user
            ? html`
                <li><a href="/">ホーム</a></li>
                <li><a href="/new">出品登録</a></li>
                <li><a href="/my/items">出品一覧</a></li>
                ${user.is_admin &&
                html`<li><a href="/admin">管理者ページ</a></li>`}
                <li>
                  <form action="/logout" method="POST">
                    <input type="submit" value="ログアウト" />
                  </form>
                </li>
              `
            : html`
                <li><a class="button" href="/login">ログイン</a></li>
                <li><a class="button" href="/register">ユーザー登録</a></li>
              `}
        </ul>
      </nav>
    <//>
  `;
};

render(html`<${App} />`, document.getElementById("header"));
