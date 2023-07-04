const path = require("node:path")
const { mkdir } = require("node:fs/promises")
const { exec } = require("node:child_process")

const deployPath = (process.env.DEPLOYMENT_PATH || "/").replace(/^\//, ""),
      resourcePath = (process.env.RESOURCE_PATH || "/resources"),
      directoryPath = '/adventure/dist/client'

async function moveToDeployDir(directoryPath, deployPath, resourcePath) {
  console.log(`moving output to deployment path dir '${deployPath}'`)

  const deployPathDir = deployPath.split("/")[0],
        resourcePathDir = resourcePath.split("/")[1],
        fullDeploymentPath = path.join(directoryPath, deployPath),
        command = `cd ${directoryPath} && ls -A | grep -v -e ${deployPathDir} -e ${resourcePathDir} | xargs mv -t ${fullDeploymentPath}`

  await mkdir(fullDeploymentPath, { recursive: true })

  console.log(`running command: ${command}`)

  exec(command, (err, stdOut, stdErr) => {
    if (err)
      console.error(err)
    else {
      if (stdOut !== "")
        console.log(stdOut)

      if (stdErr !== "")
        console.error(stdErr)
    }
  })
}

if (deployPath === "")
  console.log("deployment path is the root directory - moving output not necessary")
else {
  moveToDeployDir(directoryPath, deployPath, resourcePath)
}