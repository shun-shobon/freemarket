import { html, render, Fragment, useState, useRef } from "./deps.js";
import { useInput, useRadio } from "./utils.js";

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
  const dialogRef = useRef(null);

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
    dialogRef.current.showModal();
  };

  // OKボタン押下時のハンドラ
  // フォームの送信を実行
  const handleOk = () => formRef.current.submit();
  // キャンセルボタン押下時のハンドラ
  // 確認ダイアログを閉じる
  const handleCancel = () => dialogRef.current.close();

  return html`
    <div>
      <h1>出品登録</h1>
      <form
        action="/new"
        method="POST"
        enctype="multipart/form-data"
        onSubmit=${handleConfirm}
        ref=${formRef}
      >
        <label for=${nameProps.id}>商品名</label>
        <input type="text" required ...${nameProps} />

        <label for=${descriptionProps.id}>商品説明</label>
        <textarea required ...${descriptionProps} />

        <fieldset>
          <legend>画像</legend>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange=${handleImageChange}
          />
          ${image && html`<img src=${image} />`}
        </fieldset>

        <fieldset>
          <legend>譲渡先</legend>
          ${typeProps.radios.map((type) => {
            const { label, ...props } = type;
            return html`
              <label>
                <input type="radio" ...${props} />
                ${label}
              </label>
            `;
          })}
        </fieldset>

        <label for=${deadlineProps.id}>期限</label>
        <input
          type="datetime-local"
          disabled=${typeProps.value !== "lottery"}
          required=${typeProps.value === "lottery"}
          ...${deadlineProps}
        />

        <input type="submit" value="確認" />
      </form>

      <dialog ref=${dialogRef}>
        <header>出品確認</header>
        <p>下記の内容で出品します。よろしいですか？</p>
        <dl>
          <dt>商品名</dt>
          <dd>${nameProps.value}</dd>
          <dt>商品説明</dt>
          <dd style=${{ whiteSpace: "pre-wrap" }}>${descriptionProps.value}</dd>
          ${image &&
          html`
            <${Fragment}>
              <dt>画像</dt>
              <dd><img src=${image} /></dd>
            <//>
          `}
          <dt>譲渡先</dt>
          <dd>${typeProps.value === "race" ? "早いもの勝ち" : "抽選"}</dd>
          ${typeProps.value === "lottery" &&
          html`
            <${Fragment}>
              <dt>期限</dt>
              <dd>${new Date(deadlineProps.value).toLocaleString()}</dd>
            <//>
          `}
        </dl>
        <menu>
          <button onClick=${handleOk}>OK</button>
          <button onClick=${handleCancel}>キャンセル</button>
        </menu>
      </dialog>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
