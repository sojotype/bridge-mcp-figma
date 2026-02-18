const dispatchUI = (event: string, data: any) => {
  figma.ui.postMessage({ event, data });
};

const listenUI = (event: string, callback: (data: any) => void) => {
  figma.ui.onmessage = (message) => {
    if (message.event === event) {
      callback(message.data);
    }
  };
};

export { dispatchUI, listenUI };
