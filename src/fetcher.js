import axios from "axios";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

import { MATCH_ID, REFRESH_TIME_MS, IMAGE_DIR } from "../config.js";

const LIVE_SCORE_URL = `https://www.cricbuzz.com/api/cricket-match/commentary/${MATCH_ID}`;
const FILE_NAME = "./score.xlsx";

const __dirname = path.resolve(path.dirname(""));

function clearFile() {
  try {
    fs.closeSync(fs.openSync(FILE_NAME, "w"));
  } catch (error) {
    console.log(error.message);
  }
}

clearFile();

const file = xlsx.readFile(FILE_NAME);
const sheet_name = file.SheetNames[0];
const sheet = file.Sheets[sheet_name];

function getImage(name) {
  if (!name) return "";
  // console.log(name);
  let imageName = name.replace(/ /g, "");
  imageName = imageName + ".png";
  // const imagePath = `${imgDir}/${imageName}.png`;
  const imagePath = path.join(__dirname, IMAGE_DIR, imageName);
  return imagePath;
}

let prevBallNbr = 0;
function monitorCommentary(commentaryList) {
  const [currentBall = {}] = commentaryList;
  const { ballNbr } = currentBall;

  if (ballNbr !== 0 && ballNbr <= prevBallNbr) {
    return;
  }
  prevBallNbr = ballNbr;
  const { event, commText } = currentBall;
  if (event === "NONE") {
    return;
  }
  // const [players, result, ...commentary] = commText.split(",");
  console.log(event, commText);
}

function formatResponse(response) {
  const { matchHeader, miniscore, commentaryList } = response.data;

  monitorCommentary(commentaryList);

  const {
    // state,
    // status,
    // tossResults,
    team1: { id: id1, shortName: teamOneName } = {},
    team2: { id: id2, shortName: teamTwoName } = {},
    seriesName,
    // seriesDesc,
  } = matchHeader;

  const teams = {
    [id1]: {
      name: "",
      sortName: teamOneName,
      score: "Yet to bat",
    },
    [id2]: {
      name: "",
      sortName: teamTwoName,
      score: "Yet to bat",
    },
  };

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

  const battingTeamName = teams[batTeam.teamId].sortName;
  const battingTeamScore = `${batTeam.teamScore}-${batTeam.teamWkts} (${overs})`;
  debugger;
  let bowlingTeamId;

  Object.keys(teams).some((id) => {
    if (id != batTeam.teamId) {
      bowlingTeamId = id;
      return true;
    }
    return false;
  });

  const bowlingTeam = teams[bowlingTeamId];

  const partnerShipValue = `${partnerShip.runs}/${partnerShip.balls}`;
  const batterScore = `${batsmanStriker.batRuns} (${batsmanStriker.batBalls})`;

  const nonBatterScore = `${batsmanNonStriker.batRuns} (${batsmanNonStriker.batBalls})`;

  // finding bowling team score
  const { inningsScoreList } = matchScoreDetails || {};

  const currentInningNum = inningsScoreList.length;
  if (currentInningNum === 2) {
    const [, firstInning] = inningsScoreList;
    const {
      batTeamId,
      // batTeamName,
      score,
      wickets,
      overs: fiOvers,
      // isDeclared,
    } = firstInning;
    const firstInningScore = `${score}-${wickets} (${fiOvers})`;
    if (firstInningScore) {
      teams[batTeamId].score = firstInningScore;
    }
  }

  const aoa = [
    ["Status", seriesName],
    ["Batting team", battingTeamName, getImage(battingTeamName)],
    ["Score", battingTeamScore],
    ["Bowling team", bowlingTeam.sortName, getImage(bowlingTeam.sortName)],
    ["Score", bowlingTeam.score],
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

  // inningsScoreList.forEach((_, index, arr) => {
  //   const inning = arr[arr.length - 1 - index];
  //   // console.log(l);
  //   const {
  //     inningsId,
  //     batTeamId,
  //     score,
  //     wickets,
  //     overs,
  //     isDeclared,
  //     isFollowOn,
  //     ballNbr,
  //   } = inning;
  //   const battingTeamName = teams[batTeamId];
  //   [
  //     ["Inning No", inningsId],
  //     ["Batting Team", battingTeamName],
  //     ["Score", score],
  //     ["Wickets", wickets],
  //     ["Overs", overs],
  //     ["Declared", isDeclared ? "Yes" : "No"],
  //     ["Follow on", isFollowOn ? "Yes" : "No"],
  //     ["Balls", ballNbr],
  //   ].forEach((row) => aoa.push(row));
  // });

  //  COMMENTARY MONITORING..

  return aoa;
}

function pullData() {
  axios
    .get(LIVE_SCORE_URL)
    .then((response) => {
      if (response.status === 200) {
        const aoa = formatResponse(response);
        xlsx.utils.sheet_add_aoa(sheet, aoa, { origin: "A1" });
        xlsx.writeFile(file, FILE_NAME);
        const date = new Date();
        // console.log("Refreshed..", date.toLocaleTimeString());
      } else {
        console.log(response.status);
      }
    })
    .catch((error) => console.log("Error", error));
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
