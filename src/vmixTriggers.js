import axios from "axios";

const VMIX_URL = "http://localhost:8088/API";
const QUICK_SHOT_PLAY_DURATION = 1000;

function switchInput(input, func = "cut", duration = 1000) {
  const config = {
    URL: VMIX_URL,
    METHOD: "GET",
    params: {
      Function: func,
      Input: input,
      duration,
    },
  };
  axios
    .request(config)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => console.log(error.message));
}

function resumePlayback() {
  const input = 2;
  const fun = "Cut";
  const duration = 100;
  switchInput(input, fun, duration);
  setTimeout(resumePlayback, QUICK_SHOT_PLAY_DURATION);
}

function playFour() {
  const input = 1;
  const fun = "CubeZoom";
  switchInput(input, fun);
}

function playSix() {}

export { resumePlayback, playFour, playSix };
