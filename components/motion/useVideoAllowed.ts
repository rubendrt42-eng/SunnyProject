"use client";

import { useSyncExternalStore } from "react";

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

function getConnection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = getConnection();
  mq.addEventListener("change", callback);
  connection?.addEventListener?.("change", callback);
  return () => {
    mq.removeEventListener("change", callback);
    connection?.removeEventListener?.("change", callback);
  };
}

function getSnapshot(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = getConnection();
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return false;
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the hero background video should play — false under
 * prefers-reduced-motion, data-saver mode, or a slow (2G-class) connection,
 * in which case the <video>'s `poster` frame is shown instead. Uses
 * useSyncExternalStore (matching HeaderInteractive's scroll pattern) so
 * this reacts live to changes rather than only checking once on mount.
 */
export function useVideoAllowed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
