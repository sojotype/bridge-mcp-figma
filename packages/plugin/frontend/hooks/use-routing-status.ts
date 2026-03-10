import { useCallback, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { frontendBroker } from "../lib/frontend-broker";
import {
  type EndpointStatus,
  type EndpointType,
  endpointsStore,
  REMOTE_STATUS_CACHE_MS,
} from "../stores/endpoints";
import { getNormalizedUrl, useValidUrl } from "./use-valid-url";

interface StatusResult {
  message?: string;
  status: "online" | "warning" | "offline";
  checkedUrl?: string;
}

function checkStatus(type: EndpointType, url: string): Promise<StatusResult> {
  return frontendBroker
    .postAndWait("checkEndpointStatus", { url, type }, { timeoutMs: 8000 })
    .then((res) => {
      const result: StatusResult = {
        status: res.status,
        message: res.message,
        checkedUrl: res.checkedUrl ?? url,
      };
      if (result.status !== "online") {
        const checkedUrl = result.checkedUrl ?? url;
        console.warn(
          `[C2F:FRONTEND] ${type.toUpperCase()} status: ${result.status}. URL: ${checkedUrl}. Message: ${result.message ?? "(no message)"}.`
        );
      }
      return result;
    })
    .catch((err) => {
      const result: StatusResult = {
        status: "offline",
        message: "Cannot reach server",
        checkedUrl: url,
      };
      console.error(
        `[C2F:FRONTEND] ${type.toUpperCase()} status check failed (offline). URL: ${url}. ${result.message}. Error:`,
        err
      );
      return result;
    });
}

export function useRoutingStatus(type: EndpointType) {
  const snap = useSnapshot(endpointsStore);
  const store = endpointsStore[type];
  const localUrl = snap[type].user.local ?? snap[type].default.local;
  const remoteUrl = snap[type].user.remote ?? snap[type].default.remote;

  const { normalizedUrl: localNormalized } = useValidUrl(localUrl, "local");
  const { normalizedUrl: remoteNormalized } = useValidUrl(remoteUrl, "remote");

  const isCheckingLocalRef = useRef(false);
  const isCheckingRemoteRef = useRef(false);

  const applyResult = useCallback(
    (
      routing: "local" | "remote",
      result: StatusResult,
      submittedUrl: string
    ) => {
      const failures = store.consecutiveFailures[routing];
      const nextFailures = result.status === "offline" ? failures + 1 : 0;
      const checkedUrl = result.checkedUrl ?? submittedUrl;

      store.consecutiveFailures[routing] = nextFailures;
      store.statusMessage[routing] = result.message ?? null;
      store.checkedUrl[routing] = checkedUrl;
      store.lastSubmittedUrl[routing] = submittedUrl;

      if (result.status === "offline") {
        if (routing === "remote" || nextFailures >= 2) {
          store.status[routing] = "offline";
        }
      } else {
        store.status[routing] = result.status;
      }
    },
    [store]
  );

  const getCurrentLocalUrl = useCallback(() => {
    const url = store.user.local ?? store.default.local;
    return getNormalizedUrl(url, "local");
  }, [store]);

  const getCurrentRemoteUrl = useCallback(() => {
    const url = store.user.remote ?? store.default.remote;
    return getNormalizedUrl(url, "remote");
  }, [store]);

  const checkLocal = useCallback(() => {
    const url = getCurrentLocalUrl();
    if (!url || isCheckingLocalRef.current) {
      return;
    }
    isCheckingLocalRef.current = true;
    store.isChecking.local = true;
    store.statusMessage.local = null;

    checkStatus(type, url)
      .then((result) => {
        applyResult("local", result, url);
      })
      .finally(() => {
        isCheckingLocalRef.current = false;
        store.isChecking.local = false;
      });
  }, [type, store, applyResult, getCurrentLocalUrl]);

  const checkRemote = useCallback(
    (forceRefresh = false) => {
      const url = getCurrentRemoteUrl();
      if (!url || isCheckingRemoteRef.current) {
        return;
      }

      if (!forceRefresh) {
        const checkedAt = store.remoteStatusCheckedAt;
        const cacheValid =
          checkedAt && Date.now() - checkedAt < REMOTE_STATUS_CACHE_MS;
        if (cacheValid) {
          return;
        }
      }

      isCheckingRemoteRef.current = true;
      store.isChecking.remote = true;
      store.statusMessage.remote = null;

      checkStatus(type, url)
        .then((result) => {
          applyResult("remote", result, url);
          store.remoteStatusCheckedAt = Date.now();
        })
        .finally(() => {
          isCheckingRemoteRef.current = false;
          store.isChecking.remote = false;
        });
    },
    [type, store, applyResult, getCurrentRemoteUrl]
  );

  const checkLocalRef = useRef(checkLocal);
  const checkRemoteRef = useRef(checkRemote);
  checkLocalRef.current = checkLocal;
  checkRemoteRef.current = checkRemote;
  useEffect(() => {
    checkLocalRef.current();
    checkRemoteRef.current(false);
  }, []);

  const lastSubmittedLocal = snap[type].lastSubmittedUrl.local;
  const lastSubmittedRemote = snap[type].lastSubmittedUrl.remote;
  const isLocalEditing =
    lastSubmittedLocal != null && localNormalized !== lastSubmittedLocal;
  const isRemoteEditing =
    lastSubmittedRemote != null && remoteNormalized !== lastSubmittedRemote;

  const isCheckingLocal = snap[type].isChecking.local;
  const isCheckingRemote = snap[type].isChecking.remote;

  return {
    localStatus: (isLocalEditing
      ? null
      : snap[type].status.local) as EndpointStatus,
    remoteStatus: (isRemoteEditing
      ? null
      : snap[type].status.remote) as EndpointStatus,
    isCheckingLocal,
    isCheckingRemote,
    localMessage: snap[type].statusMessage.local,
    remoteMessage: snap[type].statusMessage.remote,
    localCheckedUrl: snap[type].checkedUrl.local,
    remoteCheckedUrl: snap[type].checkedUrl.remote,
    refreshLocal: checkLocal,
    refreshRemote: () => checkRemote(true),
    checkForRouting: (routing: "local" | "remote") => {
      if (routing === "local") {
        checkLocal();
      } else {
        checkRemote(false);
      }
    },
  };
}
