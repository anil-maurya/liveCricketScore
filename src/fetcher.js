import axios from "axios";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

import { MATCH_ID, REFRESH_TIME_MS, IMAGE_DIR } from "../config.js";

const liveScoreURL = `https://www.cricbuzz.com/api/cricket-match/commentary/${MATCH_ID}`;

const __dirname = path.resolve(path.dirname(""));

const fileName = "./score.xlsx";

function clearFile() {
  try {
    fs.closeSync(fs.openSync(fileName, "w"));
  } catch (error) {
    console.log(error.message);
  }
}

clearFile();

const file = xlsx.readFile(fileName);
const sheet_name = file.SheetNames[0];
const sheet = file.Sheets[sheet_name];

function getImage(name) {
  if (!name) return "";

  let imageName = name.replace(/ /g, "");
  imageName = imageName + ".png";
  // const imagePath = `${imgDir}/${imageName}.png`;
  const imagePath = path.join(__dirname, IMAGE_DIR, imageName);
  return imagePath;
}

const teams = {};

function formatResponse(response) {
  const { matchHeader, miniscore } = response.data;

  const {
    // state,
    // status,
    // tossResults,
    team1: { id: id1, shortName: teamOneName } = {},
    team2: { id: id2, shortName: teamTwoName } = {},
    seriesName,
    // seriesDesc,
  } = matchHeader;

  teams[id1] = teamOneName;
  teams[id2] = teamTwoName;

  // const { tossWinnerName, decision } = tossResults || {};

  const {
    batsmanStriker = {},
    batsmanNonStriker = {},
    bowlerStriker = {},
    bowlerNonStriker = {},
    overs,
    recentOvsStats,
    batTeam = {},
    partnerShip = {},
    currentRunRate,
    requiredRunRate,
    // lastWicket,
    // latestPerformance,
    matchScoreDetails,
  } = miniscore || {};

  // const [lp1 = {}, lp2 = {}] = latestPerformance || [];

  const [performanceThisOver, performanceLastOver] = recentOvsStats.split("|");

  const battingTeamName = teams[batTeam.teamId];
  const battingTeamScore = `${batTeam.teamScore}-${batTeam.teamWkts} (${overs})`;

  let bowlingTeamId;

  Object.keys(teams).some((id) => {
    if (id !== batTeam.teamId) {
      bowlingTeamId = id;
      return true;
    }
    return false;
  });

  const bowlingTeamName = teams[bowlingTeamId];

  const partnerShipValue = `${partnerShip.runs}/${partnerShip.balls}`;
  const batterScore = `${batsmanStriker.batRuns} (${batsmanStriker.batBalls})`;

  const nonBatterScore = `${batsmanNonStriker.batRuns} (${batsmanNonStriker.batBalls})`;

  const aoa = [
    ["Status", seriesName],
    ["Batting team", battingTeamName, getImage(battingTeamName)],
    ["Score", battingTeamScore],
    ["Bowling team", bowlingTeamName],
    ["Score", "Yet to bat"],
    ["Current run rate", currentRunRate],
    ["Required run rate", requiredRunRate],
    ["Overs", overs],
    ["Partnership(runs/balls)", partnerShipValue],
    ["Dot balls", ""],
    ["Last over", performanceLastOver],
    ["This over", performanceThisOver],
    // ["Team 2", teamTwoName, getImage(teamTwoName)],
    // ["Match state", state],
    // ["Match status", status],
    // ["Toss result"],
    // ["Winner", tossWinnerName],
    // ["Decision", decision],
    // ["Batting team", ""],
    // ["Name", teams[batTeam.teamId],
    // ("Score", batTeam.teamScore)
    // ["Wicket", batTeam.teamWkts],
    // ["Recent overs", recentOvsStats],
    // ["Last wicket", lastWicket],
    // ["Latest Performance"],
    // [lp1.label || "Last 3 overs"],
    // ["Runs", lp1.runs],
    // ["Wickets", lp1.wkts],
    // [lp2.label || "Last 5 overs"],
    // ["Runs", lp2.runs],
    // ["Wickets", lp2.wkts],
    ["Striker Batsman", ""],
    ["Name", batsmanStriker.batName, getImage(batsmanStriker.batName)],
    ["Score(runs/balls)", batterScore],
    ["Dot", batsmanStriker.batDots],
    ["Fours", batsmanStriker.batFours],
    ["Sixes", batsmanStriker.batSixes],
    ["StrikeRate", batsmanStriker.batStrikeRate],
    ["Non striker Batsman", ""],
    ["Name", batsmanNonStriker.batName, getImage(batsmanNonStriker.batName)],
    ["Score(runs/balls)", nonBatterScore],
    ["Dot", batsmanNonStriker.batDots],
    ["Fours", batsmanNonStriker.batFours],
    ["Sixes", batsmanNonStriker.batSixes],
    ["StrikeRate", batsmanNonStriker.batStrikeRate],
    ["Striker Bowler"],
    ["Name", bowlerStriker.bowlName, getImage(bowlerStriker.bowlName)],
    ["Maidens", bowlerStriker.bowlMaidens],
    ["No Balls", bowlerStriker.bowlNoballs],
    ["Overs", bowlerStriker.bowlOvs],
    ["Runs", bowlerStriker.bowlRuns],
    ["Wides", bowlerStriker.bowlWides],
    ["Wickets", bowlerStriker.bowlWkts],
    ["Economy", bowlerStriker.bowlEcon],
    ["Non Striker Bowler"],
    ["Name", bowlerNonStriker.bowlName, getImage(bowlerNonStriker.bowlName)],
    ["Maidens", bowlerNonStriker.bowlMaidens],
    ["No Balls", bowlerNonStriker.bowlNoballs],
    ["Overs", bowlerNonStriker.bowlOvs],
    ["Runs", bowlerNonStriker.bowlRuns],
    ["Wides", bowlerNonStriker.bowlWides],
    ["Wickets", bowlerNonStriker.bowlWkts],
    ["Economy", bowlerNonStriker.bowlEcon],
  ];

  const { inningsScoreList = [] } = matchScoreDetails || {};

  inningsScoreList.forEach((_, index, arr) => {
    const inning = arr[arr.length - 1 - index];
    // console.log(l);
    const {
      inningsId,
      batTeamId,
      score,
      wickets,
      overs,
      isDeclared,
      isFollowOn,
      ballNbr,
    } = inning;
    const battingTeamName = teams[batTeamId];
    [
      ["Inning No", inningsId],
      ["Batting Team", battingTeamName],
      ["Score", score],
      ["Wickets", wickets],
      ["Overs", overs],
      ["Declared", isDeclared ? "Yes" : "No"],
      ["Follow on", isFollowOn ? "Yes" : "No"],
      ["Balls", ballNbr],
    ].forEach((row) => aoa.push(row));
  });

  return aoa;
}

function pullData() {
  axios
    .get(liveScoreURL)
    .then((response) => {
      if (response.status === 200) {
        const aoa = formatResponse(response);
        xlsx.utils.sheet_add_aoa(sheet, aoa, { origin: "A1" });
        xlsx.writeFile(file, fileName);
        const date = new Date();
        console.log("Refreshed..", date.toLocaleTimeString());
      } else {
        console.log(response.status);
      }
    })
    .catch((error) => console.log("Error", error.message));
}

function start() {
  console.log("Starting...");

  pullData();

  const id = setInterval(pullData, REFRESH_TIME_MS);
  process.on("SIGINT", () => {
    console.log("Stopping... done!");
    clearInterval(id);
  });
}

start();
