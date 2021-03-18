const { exec } = require("child_process");

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  exec("ls -la", (error, stdout, stderr) => {
    if (error) {
      replaceText("foo", `exec error: ${error.message}`);
      return;
    }

    if (stderr) {
      replaceText("foo", `StdError: ${stderr}`);
      return;
    }

    replaceText("foo", stdout);
  })

})
