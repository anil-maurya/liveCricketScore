import axios from "axios";

axios.defaults.baseURL = "http://localhost:8088/API";
const QUICK_SHOT_PLAY_DURATION = 2000;

function switchInput(input, func = "cut", duration = 1000) {
  const config = {
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
    .catch((error) => console.log(error));
}

function resumePlayback() {
  const input = 2;
  const fun = "Wipe";
  switchInput(input, fun);
}

function playFour() {
  const input = 1;
  const fun = "CubeZoom";
  switchInput(input, fun);
  setTimeout(resumePlayback, QUICK_SHOT_PLAY_DURATION);
}

function playSix() {}

export { resumePlayback, playFour, playSix };
