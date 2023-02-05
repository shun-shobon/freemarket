import { html, render } from "./deps.js";
import { useInput } from "./utils.js";

const App = () => {
  // 各種フォームのプロパティ
  const nameProps = useInput("", "name");
  const emailProps = useInput("", "email");
  const passwordProps = useInput("", "password");

  return html`
    <main class="container vstack">
      <h1>ユーザー登録</h1>
      <form class="vstack" action="/register" method="POST">
        <div>
          <label for=${nameProps.id}>ユーザー名</label>
          <input type="text" required ...${nameProps} />
        </div>

        <div>
          <label for=${emailProps.id}>メールアドレス</label>
          <input type="email" required ...${emailProps} />
        </div>

        <div>
          <label for=${passwordProps.id}>パスワード</label>
          <input type="password" required ...${passwordProps} />
        </div>

        <input type="submit" value="登録" />
      </form>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
