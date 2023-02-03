import { useId, useState } from "./deps.js";

export const useInput = (initialValue, name) => {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const onInput = (event) => setValue(event.target.value);

  return { id, name, value, onInput };
};
