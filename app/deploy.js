const path = require("node:path")
const { mkdir, symlink } = require("node:fs/promises")
const { exec } = require("node:child_process")

const deployPath = `${process.env.URL_BASE}/${process.env.DEPLOYMENT_PATH}`.replace(/^\//, ""),
      resourcePath = (process.env.RESOURCE_PATH),
      projectRoot = "/adventure",
      distDir = "dist/client"

async function moveToDeployDir(projectRoot, distDir, deployPath, resourcePath) {
  console.log(`deploying to '${deployPath}'...`)

  const deployPathDir = deployPath.split("/")[0],
        resourcePathDir = resourcePath.split("/")[1],
        fullDistPath = path.join(projectRoot, distDir),
        fullDeploymentPath = path.join(fullDistPath, deployPath),
        command = `cd ${fullDistPath} && ls -A | grep -v -e ${deployPathDir} -e ${resourcePathDir} | xargs mv -t ${fullDeploymentPath}`

  await mkdir(fullDeploymentPath, { recursive: true })

  // console.log(`running command: ${command}`)

  await new Promise((resolve, reject) => {
    exec(command, (err, stdOut, stdErr) => {
      if (err) {
        reject(err);
      } else {
        if (stdOut !== "")
          console.log(stdOut)

        if (stdErr !== "")
          console.error(stdErr)

        resolve()
      }
    })
  })

  await symlink(path.join(projectRoot, resourcePath, "img"), path.join(projectRoot, distDir, resourcePath, "img"), "dir")
}

if (deployPath === "") {
  // console.log("deployment path is the root directory - moving output not necessary")
} else {
  moveToDeployDir(projectRoot, distDir, deployPath, resourcePath)
    .then(() => {
      console.log("✓ Deployment successful.")
    })
    .catch((reason) => {
      console.error(reason)
      console.error("✗ Deployment failed.")
    })
}