import { useId, useState, useEffect } from "./deps.js";

// ユーザー情報を取得するカスタムフック
export const useUser = () => {
  return window.USER_DATA;
};

// データを取得するカスタムフック
export const useData = () => {
  return window.DATA;
};

// 入力フォームのプロパティを生成するカスタムフック
export const useInput = (initialValue, name) => {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const onInput = (event) => setValue(event.target.value);

  return { id, name, value, onInput };
};

// ラジオボタンのプロパティを生成するカスタムフック
export const useRadio = (selections, name) => {
  const [radioValue, setRadioValue] = useState(selections[0].value);

  const radios = selections.map((selection) => {
    const { value, label } = selection;
    const checked = value === radioValue;
    const onChange = () => setRadioValue(value);

    return { value, name, label, checked, onChange };
  });

  return { value: radioValue, radios };
};

export const useItems = (user_id) => {
  const [items, setItems] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const hasPrevPage = page > 1;
  const hasNextPage = page < maxPage;
  const prevPage = () => hasPrevPage && setPage((page) => page - 1);
  const nextPage = () => hasNextPage && setPage((page) => page + 1);
  const update = () => setUpdated((updated) => !updated);

  useEffect(() => {
    const url = new URL("/items", window.location.origin);
    url.searchParams.set("page", page);
    if (user_id) url.searchParams.set("user_id", user_id);

    (async () => {
      const res = await fetch(url);
      const { items, page, max_page } = await res.json();
      setItems(items);
      setPage(page);
      setMaxPage(max_page);
    })();
  }, [page, updated]);

  return {
    items,
    page,
    setPage,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    maxPage,
    update,
  };
};
