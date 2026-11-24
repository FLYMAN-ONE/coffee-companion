import { createStore } from "../lib/createStore";

/** Show a short message at the bottom of the screen. */
export type Toast = (message: string) => void;

export const [ToastContext, useToast] = createStore<Toast>("Toast");
