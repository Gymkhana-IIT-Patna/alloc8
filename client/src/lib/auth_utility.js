import { msalInstance } from "../main.jsx";

function getRollNumber() {
  let parts = msalInstance.getAllAccounts()[0].username;
  for (let part of parts) {
    if (part.startsWith("2")) {
      return part;
    }
  }
  return "Error encountered, please report this to any of the Technical Secretaries";
  console.error(parts);
}
function getName() {
  return msalInstance.getAllAccounts()[0].name;
}

export { getRollNumber, getName };
/* vi: set et sw=2: */
