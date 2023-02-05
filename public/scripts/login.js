import { html, render } from "./deps.js";
import { useInput } from "./utils.js";

const App = () => {
  // 各種フォームのプロパティ
  const emailProps = useInput("", "email");
  const passwordProps = useInput("", "password");

  return html`
    <main class="container vstack">
      <h1>ログイン</h1>
      <form class="vstack" action="/login" method="POST">
        <div>
          <label for=${emailProps.id}>メールアドレス</label>
          <input type="email" required ...${emailProps} />
        </div>
        <div>
          <label for=${passwordProps.id}>パスワード</label>
          <input type="password" required ...${passwordProps} />
        </div>
        <input type="submit" value="ログイン" />
      </form>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
