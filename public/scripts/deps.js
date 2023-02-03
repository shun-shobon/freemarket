import { h } from "https://cdn.skypack.dev/preact@10.11.3";
import htm from "https://cdn.skypack.dev/htm@3.1.1";

export * from "https://cdn.skypack.dev/preact@10.11.3/hooks";
export { render, Fragment } from "https://cdn.skypack.dev/preact@10.11.3";

export const html = htm.bind(h);
