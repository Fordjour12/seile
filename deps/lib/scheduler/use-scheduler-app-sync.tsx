import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { synchronizeSchedulerState } from "./service";

export function SchedulerAppSync() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let syncing = false;

    async function runSync() {
      if (syncing) {
        return;
      }

      syncing = true;
      try {
        await synchronizeSchedulerState({
          notifyOverdueSummary: true,
        });
      } catch {
        // Ignore background sync failures; the screen will surface errors on demand.
      } finally {
        syncing = false;
      }
    }

    void runSync();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        void runSync();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
