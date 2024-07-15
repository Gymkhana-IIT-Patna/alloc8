import { msalInstance } from "../main.jsx";
function extractRollNumber(email) {
  const regex = /2\w{7}/;
  const match = email.match(regex);
  return match ? match[0] : null;
}

function getRollNumber() {
  let emailId = msalInstance.getAllAccounts()[0].username;
  let rollNumber = extractRollNumber(emailId);
  if(rollNumber==null)
  {
  return "Error encountered, please report this to any of the Technical Secretaries";
  }
  else
  {
    return rollNumber;
  }
  console.error(parts);
}
function getName() {
  return msalInstance.getAllAccounts()[0].name;
}

export { getRollNumber, getName };
/* vi: set et sw=2: */
