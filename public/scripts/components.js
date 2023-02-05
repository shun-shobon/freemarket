import { html, useEffect, useRef } from "./deps.js";

export const Item = ({ item, userId, children }) => {
  return html`
    <li class="item">
      ${item.image
        ? html`<img class="item__image" src=${`/uploads/${item.image}`} />`
        : html`<div class="item__image" />`}
      <h2 class="item__name">${item.name}</h2>
      <dl class="item__attributes">
        <div>
          <dt>出品者</dt>
          <dd>${item.user_name}</dd>
        </div>
        <div>
          <dt>出品日時</dt>
          <dd>
            <time datetime=${item.created_at}>
              ${new Date(item.created_at).toLocaleString()}
            </time>
          </dd>
        </div>
        ${item.deadline &&
        html`
          <div>
            <dt>応募締切</dt>
            <dd>
              <time datetime=${item.deadline}>
                ${new Date(item.deadline).toLocaleString()}
              </time>
            </dd>
          </div>
        `}
      </dl>
      <div>${children}</div>
    </li>
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
    <nav class="page-nav">
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
