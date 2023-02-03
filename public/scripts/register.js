import { html, render } from "./deps.js";
import { useInput } from "./utils.js";

const App = () => {
  // 各種フォームのプロパティ
  const nameProps = useInput("", "name");
  const emailProps = useInput("", "email");
  const passwordProps = useInput("", "password");

  return html`
    <div>
      <h1>ユーザー登録</h1>
      <form action="/register" method="POST">
        <label for=${nameProps.id}>ユーザー名</label>
        <input type="text" required ...${nameProps} />

        <label for=${emailProps.id}>メールアドレス</label>
        <input type="email" required ...${emailProps} />

        <label for=${passwordProps.id}>パスワード</label>
        <input type="password" required ...${passwordProps} />

        <input type="submit" value="登録" />
      </form>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
