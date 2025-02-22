import { proxy, subscribe } from "valtio";
import { subscribeKey } from "valtio/utils";

let globalStore = proxy({
  connectedToServer: false,
  eegStreamIsAvailable: false,
  page: "index",
  settings: {
    selected: {
      socialMedia: "instagram",
      movement: "none",
    },
    options: {
      socialMedia: {
        instagram: {
          url: "https://instagram.com/reels",
          title: "Instagram Reels",
        },
        youtube: {
          url: "https://youtube.com/shorts",
          title: "YouTube Shorts",
        },
      },
      movement: {
        thumbAviduction: "Thumb Aviduction",
        flexion: "Flexion",
        wristExtension: "Wrist Extension",
        none: "None",
      },
    },
  },
  ui: {
    videoState: {
      // isPlaying: false,
      isPlaying: true,
    },

    trainingBtn: {
      text: "",
      state: "",
    },
    trainingState: {
      state: "stop",
      trialCount: 0,
      bgColors: {
        start: "bg-slate-500",
        stop: "bg-slate-500",
        rest: "bg-red-500",
        action: "bg-green-500",
        complete: "bg-slate-500",
      },
      text: {
        start: "Training starting",
        stop: "Training stopped",
        rest: "Rest",
        action: "Action",
        complete: "Training complete",
      },
      icon: {
        thumbAviduction: {
          start: "thumb-rest",
          stop: "thumb-rest",
          rest: "thumb-rest",
          action: "thumb-action",
          complete: "empty",
        },
        flexion: {
          start: "extension-flexion-rest",
          stop: "extension-flexion-rest",
          rest: "extension-flexion-rest",
          action: "flexion-action",
          complete: "empty",
        },
        wristExtension: {
          start: "extension-flexion-rest",
          stop: "extension-flexion-rest",
          rest: "extension-flexion-rest",
          action: "extenstion-action",
          complete: "empty",
        },
        none: {
          start: "empty",
          stop: "empty",
          rest: "empty",
          action: "empty",
          complete: "empty",
        },
      },
      celebrate: {
        start: "empty",
        stop: "empty",
        rest: "empty",
        action: "empty",
        complete: "celebrate",
      },
    },

    predictionBtn: {
      text: "",
      state: "",
    },
    predictionState: {
      state: "stop",
      bgColors: {
        start: "bg-slate-500",
        stop: "bg-slate-500",
        rest: "bg-red-500",
        action: "bg-green-500",
        actionDetected: "bg-blue-500",
        complete: "bg-slate-500",
      },
      text: {
        start: "Predictions starting",
        stop: "Predictions stopped",
        rest: "Rest",
        action: "Action",
        actionDetected: "Yay!",
        complete: "Predictions complete",
      },
      icon: {
        thumbAviduction: {
          start: "thumb-rest",
          stop: "thumb-rest",
          rest: "thumb-rest",
          action: "thumb-action",
          complete: "empty",
          actionDetected: "empty",
        },
        flexion: {
          start: "extension-flexion-rest",
          stop: "extension-flexion-rest",
          rest: "extension-flexion-rest",
          action: "flexion-action",
          complete: "empty",
          actionDetected: "empty",
        },
        wristExtension: {
          start: "extension-flexion-rest",
          stop: "extension-flexion-rest",
          rest: "extension-flexion-rest",
          action: "extenstion-action",
          complete: "empty",
          actionDetected: "empty",
        },
        none: {
          start: "empty",
          stop: "empty",
          rest: "empty",
          action: "empty",
          complete: "empty",
          actionDetected: "empty",
        },
      },
      celebrate: {
        start: "empty",
        stop: "empty",
        rest: "empty",
        action: "empty",
        complete: "celebrate",
        actionDetected: "celebrate",
      },
    },
  },

  __fns: {},
});

globalStore.__fns.set = (key, value) => (globalStore[key] = value);
globalStore.__fns.get = (key) => globalStore[key];
globalStore.__fns.subscribeKeyValtio = subscribeKey;
globalStore.__fns.subscribeKey = (key, fn) =>
  subscribeKey(globalStore, key, fn);
globalStore.__fns.subscribe = (fn) => subscribe(globalStore, fn);
globalStore.__fns.send = (id, data) => {
  window.api.send("toMain", { id, data });
};

globalStore.__fns.initialize = () => {
  if (window.api) {
    window.api.send("toMain", { id: "init" });
    window.api.send("toMain", { id: "req:eeg-stream-availability" });
  }
  if (localStorage.getItem("selected-settings")) {
    globalStore.settings.selected = JSON.parse(
      localStorage.getItem("selected-settings"),
    );
  }
};

globalStore.__fns.subscribeKey("connectedToServer", (v) => {
  if (!v) {
    globalStore.eegStreamIsAvailable = false;
  }
});

globalStore.__fns.subscribe((v) => {
  if (["settings", "selected"].some((k) => v[0][1].includes(k))) {
    localStorage.setItem(
      "selected-settings",
      JSON.stringify(globalStore.settings.selected),
    );
  }
});

if (window.api) {
  window.api.receive("fromMain", ({ id, data }) => {
    switch (id) {
      case "py:init":
      case "py:connect":
        globalStore.connectedToServer = true;
        break;
      case "py:disconnect":
        globalStore.connectedToServer = false;
        break;
      case "py:eeg-stream-availability-updated":
        globalStore.eegStreamIsAvailable = data.value;
        break;
      case "py:set-training-status":
        globalStore.ui.trainingState.state = data.state;
        globalStore.ui.trainingState.trialCount = data.trialCount;
        break;
      case "py:set-prediction-status":
        globalStore.ui.predictionState.state = data.state;
        break;
      case "py:action-detected":
        globalStore.ui.predictionState.state = "actionDetected";
        break;
      // case "info:video-playing":
      //   globalStore.ui.videoState.isPlaying = data.value;
      //   break;
    }
  });
}

export default globalStore;
