import { html, render } from "./deps.js";
import { useInput } from "./utils.js";

const App = () => {
  // 各種フォームのプロパティ
  const emailProps = useInput("", "email");
  const passwordProps = useInput("", "password");

  return html`
    <div>
      <h1>ログイン</h1>
      <form action="/login" method="POST">
        <label for=${emailProps.id}>メールアドレス</label>
        <input type="email" required ...${emailProps} />

        <label for=${passwordProps.id}>パスワード</label>
        <input type="password" required ...${passwordProps} />

        <input type="submit" value="ログイン" />
      </form>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
