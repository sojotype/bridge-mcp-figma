const sendBackend = (event: string, data: unknown) => {
  parent.postMessage({ pluginMessage: { event, data } }, "*");
};

const listenBackend = (event: string, callback: (data: unknown) => void) => {
  window.onmessage = (message) => {
    if (message.data.pluginMessage?.event === event) {
      callback(message.data.pluginMessage.data);
    }
  };
};

export const frontendBroker = { sendBackend, listenBackend };
