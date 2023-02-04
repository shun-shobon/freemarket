import { html, render, useState, useEffect } from "./deps.js";
import { useUser } from "./utils.js";

const Item = ({ item, userId }) => {
  return html`
    <section>
      ${item.image && html`<img src=${`/uploads/${item.image}`} />`}
      <h2>${item.name}</h2>
      <div>出品者: ${item.user_name}</div>
      <div>
        出品日時:
        <time datetime=${item.created_at}
          >${new Date(item.created_at).toLocaleString()}</time
        >
      </div>
      <div>
        <a href=${`/item/${item.id}`}
          >${item.user_id === userId ? "応募状況確認" : "応募する"}</a
        >
      </div>
    </section>
  `;
};

const App = () => {
  const user = useUser();

  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const url = new URL("/items", window.location.origin);
    url.searchParams.set("page", page);

    (async () => {
      const res = await fetch(url);
      const { items, page, max_page } = await res.json();
      setItems(items);
      setPage(page);
      setMaxPage(max_page);
    })();
  }, [page]);

  return html`
    <main>
      <h1>ホーム</h1>
      ${items.map(
        (item) =>
          html`<${Item} item=${item} userId=${user?.id} key=${item.id} />`
      )}
      <nav>
        <button
          disabled=${page <= 1}
          onClick=${() => setPage((prev) => prev - 1)}
        >
          «
        </button>
        ${new Array(maxPage).fill().map((_, i) => {
          const p = i + 1;
          return html`
            <button disabled=${p === page} onClick=${() => setPage(p)}>
              ${p}
            </button>
          `;
        })}
        <button
          disabled=${maxPage <= page}
          onClick=${() => setPage((prev) => prev + 1)}
        >
          »
        </button>
      </nav>
    </main>
  `;
};

render(html`<${App} />`, document.getElementById("root"));
