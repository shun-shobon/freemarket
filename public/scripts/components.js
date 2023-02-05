import { html, useEffect, useRef } from "./deps.js";

export const Item = ({ item, userId, children }) => {
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
      <div>${children}</div>
    </section>
  `;
};

export const Modal = ({ children, show }) => {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show]);

  return html`<dialog ref=${dialogRef}>${children}</dialog>`;
};

export const PageNav = ({
  page,
  maxPage,
  setPage,
  hasPrevPage,
  hasNextPage,
  nextPage,
  prevPage,
}) => {
  return html`
    <nav>
      <button disabled=${!hasPrevPage} onClick=${prevPage}>«</button>
      ${new Array(maxPage).fill().map((_, i) => {
        const p = i + 1;
        return html`
          <button disabled=${p === page} onClick=${() => setPage(p)}>
            ${p}
          </button>
        `;
      })}
      <button disabled=${!hasNextPage} onClick=${nextPage}>»</button>
    </nav>
  `;
};
