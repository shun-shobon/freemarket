import { html, render, useState, useEffect } from "./deps.js";
import { useItems, useUser } from "./utils.js";
import { Item, PageNav } from "./components.js";

const AppItem = ({ item, userId }) => {
  const handleClick = () => {
    window.location.href = `/items/${item.id}`;
  };

  const disabled =
    item.user_id === userId
      ? false
      : item.deadline
      ? new Date(item.deadline) < new Date()
      : item.bid_count > 0;

  const buttonMessage =
    item.user_id === userId
      ? "応募状況確認"
      : disabled
      ? "応募終了"
      : "応募する";

  return html`
    <${Item} item=${item} userId=${userId}>
      <button onClick=${handleClick} disabled=${disabled}>
        ${buttonMessage}
      </button>
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
  } = useItems();

  return html`
    <main>
      <h1>ホーム</h1>
      ${items.map(
        (item) =>
          html`<${AppItem} item=${item} userId=${user?.id} key=${item.id} />`
      )}
      <${PageNav}
        page=${page}
        maxPage=${maxPage}
        setPage=${setPage}
        hasPrevPage=${hasPrevPage}
        hasNextPage=${hasNextPage}
        prevPage=${prevPage}
        nextPage=${nextPage}
      />
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
