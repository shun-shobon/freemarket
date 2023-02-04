import { useId, useState } from "./deps.js";

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
