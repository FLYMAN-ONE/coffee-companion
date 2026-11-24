import { createContext, useContext } from "react";

/**
 * A context plus a hook that throws when used outside its provider.
 * Keep the provider component in its own .tsx file (fast refresh).
 */
export function createStore<T>(name: string) {
  const Context = createContext<T | null>(null);
  Context.displayName = name;
  const useStore = (): T => {
    const value = useContext(Context);
    if (value === null) throw new Error(`use${name} must be used inside ${name}Provider`);
    return value;
  };
  return [Context.Provider, useStore] as const;
}
