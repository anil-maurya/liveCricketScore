import axios from "axios";

axios.defaults.baseURL = "http://localhost:8088/API";
const QUICK_SHOT_PLAY_DURATION = 3000;

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
  const input = 1;
  const fun = "Wipe";
  switchInput(input, fun);
}

function toggleInput(event) {
  // console.log({event})
  let input;
  let fun = "CubeZoom";

  switch (event) {
    case "FOUR":
      input = 2;
      break;
    case "SIX":
      input = 3;
      break;
    case "WICKET":
      input = 4;
      break;
    case "FIFTY":
      input = 5;
      break;
    case "HUNDRED":
      input = 6;
      break;
    default:
      console.log("Unknown event", event);
      return;
  }

  switchInput(input, fun);
  setTimeout(resumePlayback, QUICK_SHOT_PLAY_DURATION);
}

export { toggleInput };
