import axios from "axios";
import xlsx from "xlsx";

import { MATCH_ID, REFRESH_TIME_MS } from "./config.js";

const liveScoreURL = `https://www.cricbuzz.com/api/cricket-match/commentary/${MATCH_ID}`;

const file = xlsx.readFile("./test.xlsx");
const sheet_name = file.SheetNames[0];
const sheet = file.Sheets[sheet_name];

const teams = {};

function formatResponse(response) {
  const { matchHeader, miniscore } = response.data;
  const {
    state,
    status,
    tossResults,
    team1: { id: id1, name: teamOneName },
    team2: { id: id2, name: teamTwoName },
    seriesName,
    seriesDesc,
  } = matchHeader;

  teams[id1] = teamOneName;
  teams[id2] = teamTwoName;

  const { tossWinnerName, decision } = tossResults;

  const {
    batsmanStriker,
    batsmanNonStriker,
    bowlerStriker,
    bowlerNonStriker,
    overs,
    recentOvsStats,
    batTeam,
    partnerShip,
    currentRunRate,
    requiredRunRate,
    lastWicket,
    latestPerformance,
  } = miniscore;

  const [lp1 = {}, lp2 = {}] = latestPerformance;

  const aoa = [
    ["Series name", seriesName],
    ["Description", seriesDesc],
    ["Match state", state],
    ["Match status", status],
    ["Toss result", ""],
    ["Winner", tossWinnerName],
    ["Decision", decision],
    ["Batting team", ""],
    ["Name", teams[batTeam.teamId]],
    ["Score", batTeam.teamScore],
    ["Wicket", batTeam.teamWkts],
    ["Current run rate", currentRunRate],
    ["Required run rate", requiredRunRate],
    ["Overs", overs],
    ["Recent overs", recentOvsStats],
    ["Last wicket", lastWicket],
    ["Latest Performance"],
    [lp1.label],
    ["Runs", lp1.runs],
    ["Wickets", lp1.wkts],
    [lp2.label],
    ["Runs", lp2.runs],
    ["Wickets", lp2.wkts],
    ["Striker Batsman", ""],
    ["Name", batsmanStriker.batName],
    ["Runs", batsmanStriker.batRuns],
    ["Balls", batsmanStriker.batBalls],
    ["Dot", batsmanStriker.batDots],
    ["Fours", batsmanStriker.batFours],
    ["Sixes", batsmanStriker.batSixes],
    ["StrikeRate", batsmanStriker.batStrikeRate],
    ["Non striker Batsman", ""],
    ["Name", batsmanNonStriker.batName],
    ["Runs", batsmanNonStriker.batRuns],
    ["Balls", batsmanNonStriker.batBalls],
    ["Dot", batsmanNonStriker.batDots],
    ["Fours", batsmanNonStriker.batFours],
    ["Sixes", batsmanNonStriker.batSixes],
    ["StrikeRate", batsmanNonStriker.batStrikeRate],
    ["Partnership"],
    ["Balls", partnerShip.balls],
    ["Runs", partnerShip.runs],
    ["Striker Bowler"],
    ["Name", bowlerStriker.bowlName],
    ["Maidens", bowlerStriker.bowlMaidens],
    ["No Balls", bowlerStriker.bowlNoballs],
    ["Overs", bowlerStriker.bowlOvs],
    ["Runs", bowlerStriker.bowlRuns],
    ["Wides", bowlerStriker.bowlWides],
    ["Wickets", bowlerStriker.bowlWkts],
    ["Economy", bowlerStriker.bowlEcon],
    ["Non Striker Bowler"],
    ["Name", bowlerNonStriker.bowlName],
    ["Maidens", bowlerNonStriker.bowlMaidens],
    ["No Balls", bowlerNonStriker.bowlNoballs],
    ["Overs", bowlerNonStriker.bowlOvs],
    ["Runs", bowlerNonStriker.bowlRuns],
    ["Wides", bowlerNonStriker.bowlWides],
    ["Wickets", bowlerNonStriker.bowlWkts],
    ["Economy", bowlerNonStriker.bowlEcon],
  ];

  return aoa;
}

function fetch() {
  axios
    .get(liveScoreURL)
    .then((response) => {
      if (response.status === 200) {
        const aoa = formatResponse(response);
        xlsx.utils.sheet_add_aoa(sheet, aoa, { origin: "A1" });
        xlsx.writeFile(file, "./test.xlsx");
        const date = new Date();
        console.log("Refreshed..", date.toLocaleTimeString());
      } else {
        console.log(response.status);
      }
    })
    .catch((error) => console.log("Error", error));
}

function start() {
  console.log("Starting... done!");
  fetch();
  const id = setInterval(fetch, REFRESH_TIME_MS);
  process.on("SIGINT", () => {
    console.log("Stopping... done!");
    clearInterval(id);
  });
}

start();
