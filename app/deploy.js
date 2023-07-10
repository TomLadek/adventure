const Client = require('ssh2-sftp-client')
const path = require("node:path")
const { mkdir, symlink } = require("node:fs/promises")
const { exec } = require("node:child_process")

async function doDeployment() {
  const deployPath = `${process.env.URL_BASE}/${process.env.DEPLOYMENT_PATH}`.replace(/^\//, ""),
        resourcePath = (process.env.RESOURCE_PATH),
        projectRoot = "/adventure",
        distDir = "dist/client"

  async function moveToDeployDir() {
    if (deployPath === "") {
      console.log("deployment path is the root directory - moving output not necessary")
      return
    }

    console.log(`deploying to '${deployPath}'...`)
  
    const deployPathDir = deployPath.split("/")[0],
          resourcePathDir = resourcePath.split("/")[1],
          fullDistPath = path.join(projectRoot, distDir),
          fullDeploymentPath = path.join(fullDistPath, deployPath),
          symlinkTarget = path.join(projectRoot, resourcePath, "img"),
          symlinkPath = path.join(projectRoot, distDir, resourcePath, "img"),
          lsCommand = `ls -A ${fullDistPath}`,
          mvCommand = `mv -t ${fullDeploymentPath}`
  
    await mkdir(fullDeploymentPath, { recursive: true })
    console.log(`created path ${fullDeploymentPath}`)
  
    const lsOutput = await new Promise((resolve, reject) => {
        // console.log(`running following command: ${lsCommand}`)

        exec(lsCommand, (err, stdOut, stdErr) => {
          if (err) {
            reject(err)
          } else if (stdErr) {
            reject(new Error(stdErr))
          } else {    
            resolve(stdOut)
          }
        })
      }),
      filesToMove = ((lsOutput && lsOutput.trim()) || "")
                      .split("\n")
                      .filter(fileName => fileName && fileName !== deployPathDir && fileName !== resourcePathDir)

    if (filesToMove.length > 0) {
      const mvFileOperands = filesToMove
                              .map(fileName => path.join(fullDistPath, fileName))
                              .join(" "),
            mvCommandFull = `${mvCommand} ${mvFileOperands}`

      // console.log(`running following command: ${mvCommandFull}`)

      await new Promise((resolve, reject) => {
        exec(mvCommandFull, (err, stdOut, stdErr) => {
          if (err) {
            reject(err)
          } else if (stdErr) {
            reject(new Error(stdErr))
          } else {
            if (stdOut)
              console.log(stdOut)

            resolve()
          }
        })
      })

      console.log(`copied contents of ${fullDistPath} (except ${resourcePathDir}) to ${fullDeploymentPath}`)
    } else {
      console.log("output empty or moved already")
    }
  
    try {
      await symlink(symlinkTarget, symlinkPath, "dir")
      console.log(`created symlink from ${symlinkPath} to ${symlinkTarget}`)
    } catch (ex) {
      if (ex.code === "EEXIST")
        console.log(`symlink to ${symlinkTarget} already exists`)
      else
        throw ex
    }
  }
  
  async function distribute() {
    const distributeBasePath = process.env.DISTRIBUTE_SFTP_PATH,
      distributeSftpHost = process.env.DISTRIBUTE_SFTP_HOST

    if (!distributeBasePath) {
      console.log("no distribute path given - not distributing")
      return
    }

    if (!distributeSftpHost)
      throw new Error("missing distribute host")

    const fullDeploymentPath = path.join(projectRoot, distDir, deployPath),
      distributePath = path.join(distributeBasePath, process.env.DEPLOYMENT_PATH)

    console.log(`distributing build files from ${fullDeploymentPath} to sftp://${distributeSftpHost}/${distributePath}...`)

    const sftp = new Client()

    try {
      await sftp.connect({
        host: distributeSftpHost,
        port: process.env.DISTRIBUTE_SFTP_PORT || 22,
        username: process.env.DISTRIBUTE_SFTP_USER || "guest",
        password: process.env.DISTRIBUTE_SFTP_PW || "guest"
      })

      sftp.on('upload', info => {
        console.log(`uploaded ${info.source}`);
      });
  
      await sftp.uploadDir(fullDeploymentPath, distributePath, { useFastput: !process.env.DISTRIBUTE_SFTP_NOFASTPUT })

      console.log(`Upload finished!`)
    } finally {
      await sftp.end()
    }
  }

  try {
    await moveToDeployDir()
    await distribute()

    console.log("✓ Deployment successful.")    
  } catch (ex) {
    console.error(ex)
    console.error("✗ Deployment failed.")
  }
}

doDeployment()
