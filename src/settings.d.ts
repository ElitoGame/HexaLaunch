import { Component } from "solid-js";

export const containerIds: () => string[];

export function lazy<T extends Component<any>>(
    fn: () => Promise<{ default: T }>
  ): T & { preload: () => Promise<T> };