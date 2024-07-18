import { msalInstance } from "../main.jsx";
function extractRollNumber(email) {
  const regex = /2\w{7}/;
  const match = email.match(regex);
  return match ? match[0] : null;
}

import { msalInstance } from "../main.jsx";
function getBatch(rollnum) {
  const year = rollnum[0] + rollnum[1];
  if (rollnum[2] == "0") return "btech" + year;
  if (rollnum[2] == "1" && rollnum[3] == "1") return "mtech" + year;
  if (rollnum[2] == "1" && rollnum[3] == "2") return "msc" + year;
  if (rollnum[2] == "2") return "phd" + year;

  return "error";
}

function getRollNumber() {
  let emailId = msalInstance.getAllAccounts()[0].username;
  const mailParts = emailId.split("@")[0].split("_");
  const rollNumber =
    mailParts[0].startsWith("2") || mailParts[0].startsWith("1")
      ? mailParts[0]
      : mailParts[1];
  const batch = getBatch(rollNumber);
  if (rollNumber == null) {
    return "Error encountered, please report this to any of the Technical Secretaries";
  } else {
    return rollNumber;
  }
}
function getName() {
  return msalInstance.getAllAccounts()[0].name;
}

export { getRollNumber, getName };
/* vi: set et sw=2: */
