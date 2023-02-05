import { html, render, Fragment, useState, useRef } from "./deps.js";
import { useInput, useRadio } from "./utils.js";
import { Modal } from "./components.js";

const App = () => {
  // 各種フォームのプロパティ
  const nameProps = useInput("", "name");
  const descriptionProps = useInput("", "description");
  const deadlineProps = useInput("", "deadline");
  const typeProps = useRadio(
    [
      { value: "race", label: "早いもの勝ち" },
      { value: "lottery", label: "抽選" },
    ],
    "type"
  );

  const [image, setImage] = useState(null);

  // フォームと確認ダイアログの参照
  const formRef = useRef(null);
  const [show, setShow] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setImage((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  // 確認ボタン押下時のハンドラ
  const handleConfirm = (event) => {
    // フォームの送信をキャンセル
    event.preventDefault();
    // 確認ダイアログを表示
    setShow(true);
  };

  return html`
    <main class="container">
      <h1>出品登録</h1>
      <form
        class="vstack"
        action="/new"
        method="POST"
        enctype="multipart/form-data"
        onSubmit=${handleConfirm}
        ref=${formRef}
      >
        <div>
          <label for=${nameProps.id}>商品名</label>
          <input type="text" required ...${nameProps} />
        </div>

        <div>
          <label for=${descriptionProps.id}>商品説明</label>
          <textarea required ...${descriptionProps} />
        </div>

        <fieldset>
          <legend>画像</legend>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange=${handleImageChange}
          />
          ${image && html`<div class="thumbnail"><img src=${image} /></div>`}
        </fieldset>

        <fieldset>
          <legend>譲渡先</legend>
          ${typeProps.radios.map((type) => {
            const { label, ...props } = type;
            return html`
              <label key=${props.value}>
                <input type="radio" ...${props} />
                ${label}
              </label>
            `;
          })}
        </fieldset>

        <div>
          <label for=${deadlineProps.id}>期限</label>
          <input
            type="datetime-local"
            disabled=${typeProps.value !== "lottery"}
            required=${typeProps.value === "lottery"}
            ...${deadlineProps}
          />
        </div>

        <input type="submit" value="確認" />
      </form>

      <${Modal} show=${show}>
        <header>出品確認</header>
        <p>下記の内容で出品します。よろしいですか？</p>
        <dl class="table">
          <div>
            <dt>商品名</dt>
            <dd>${nameProps.value}</dd>
          </div>
          <div>
            <dt>商品説明</dt>
            <dd>${descriptionProps.value}</dd>
          </div>
          ${image &&
          html`
            <div>
              <dt>画像</dt>
              <dd><img src=${image} /></dd>
            </div>
          `}
          <div>
            <dt>譲渡先</dt>
            <dd>${typeProps.value === "race" ? "早いもの勝ち" : "抽選"}</dd>
          </div>
          ${typeProps.value === "lottery" &&
          html`
            <div>
              <dt>期限</dt>
              <dd>${new Date(deadlineProps.value).toLocaleString()}</dd>
            </div>
          `}
        </dl>
        <menu>
          <button onClick=${() => formRef.current.submit()}>OK</button>
          <button onClick=${() => setShow(false)}>キャンセル</button>
        </menu>
      <//>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
