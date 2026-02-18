const dispatchAPI = (event: string, data: any) => {
  parent.postMessage({ pluginMessage: { event, data } }, "*");
};

const listenAPI = (event: string, callback: (data: any) => void) => {
  window.onmessage = (message) => {
    if (message.data.pluginMessage?.event === event) {
      callback(message.data.pluginMessage.data);
    }
  };
};

export { dispatchAPI, listenAPI };
