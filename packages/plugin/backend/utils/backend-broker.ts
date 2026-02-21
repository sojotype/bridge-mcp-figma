const sendFrontend = (event: string, data: unknown) => {
  figma.ui.postMessage({ event, data });
};

const listenFrontend = (event: string, callback: (data: unknown) => void) => {
  figma.ui.onmessage = (message) => {
    if (message.event === event) {
      callback(message.data);
    }
  };
};

export const backendBroker = { sendFrontend, listenFrontend };
