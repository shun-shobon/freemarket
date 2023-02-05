import { html, render, useState } from "./deps.js";
import { useItems, useUser } from "./utils.js";
import { Item, Modal, PageNav } from "./components.js";

const MyItem = ({ item, userId, onDelete }) => {
  return html`
    <${Item} item=${item} userId=${userId}>
      <button onclick=${() => onDelete(item)}>削除</button>
    <//>
  `;
};

const App = () => {
  const user = useUser();
  const {
    items,
    page,
    setPage,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    maxPage,
    update,
  } = useItems();

  const [show, setShow] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleDeleteClick = (item) => {
    setDeleteItem(item);
    setShow(true);
  };

  const handleDelete = async () => {
    const url = new URL("/delete", window.location.origin);
    const formData = new FormData();
    formData.set("id", deleteItem.id);
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setShow(false);
      update();
    }
  };

  return html`
    <main class="container vstack">
      <h1>管理者ページ(全出品一覧)</h1>
      <ul class="item-container">
        ${items.map(
          (item) =>
            html`<${MyItem}
              item=${item}
              userId=${user?.id}
              key=${item.id}
              onDelete=${handleDeleteClick}
            />`
        )}
      </ul>
      <${PageNav}
        page=${page}
        maxPage=${maxPage}
        setPage=${setPage}
        hasPrevPage=${hasPrevPage}
        hasNextPage=${hasNextPage}
        prevPage=${prevPage}
        nextPage=${nextPage}
      />
      <${Modal} show=${show}>
        <header>削除確認</header>
        <p>以下の商品を削除しますか？</p>
        <dl>
          <dt>認識番号</dt>
          <dd>${deleteItem?.id}</dd>
          <dt>商品名</dt>
          <dd>${deleteItem?.name}</dd>
        </dl>
        <menu>
          <button onClick=${handleDelete}>削除</button>
          <button onClick=${() => setShow(false)}>キャンセル</button>
        </menu>
      <//>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
