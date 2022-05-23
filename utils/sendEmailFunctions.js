const nodemailer = require("nodemailer");
exports.sendEmailAfterJobApply = async ({officialEmail,companyName},{firstName , lastName},jobTitle)=>{
    const transporterFunc = transporter(process.env.UPDATE_EMAIL,process.env.UPDATE_EMAIL_PASSWORD);
    const mailOptions = {
        from: process.env.UPDATE_EMAIL,
        to: officialEmail,
        subject: `A Candidate has applied to ${companyName}`,
        html: emailTemplateJobApply(firstName,lastName,jobTitle,companyName)
    }
    transporterFunc.sendMail(mailOptions,(err,data)=>{
        if(err)
            console.log(err);
    });
}
exports.sendEmailAfterUserSignup = async ({firstName,lastName,email})=>{
    const transporterFunc = transporter(process.env.FOUNDER_EMAIL,process.env.FOUNDER_EMAIL_PASSWORD);
    const mailOptions = {
        from: process.env.FOUNDER_EMAIL,
        to: email,
        subject: `Welcome To Cryptonaukri ${firstName} ${lastName}`,
        html: emailTemplateSignup(firstName,lastName)
    }
    transporterFunc.sendMail(mailOptions,(err,data)=>{
        if(err)
            console.log(err);
    });
}
exports.sendEmailAfterBusinessSignup = async ({executiveName,officialEmail})=>{
    const transporterFunc = transporter(process.env.FOUNDER_EMAIL,process.env.FOUNDER_EMAIL_PASSWORD);
    const mailOptions = {
        from: process.env.FOUNDER_EMAIL,
        to: officialEmail,
        subject: `Welcome To Cryptonaukri ${executiveName}`,
        html: emailTemplateSignup(executiveName,"")
    }
    transporterFunc.sendMail(mailOptions,(err,data)=>{
        if(err)
            console.log(err);
    });
}

const transporter = (authUser , authPassword) => {
    return nodemailer.createTransport({
        service: "smtp",
        host: process.env.EMAIL_HOST,
        name: process.env.EMAIL_NAME,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: authUser,
            pass: authPassword
        }
    });
};

const emailTemplateSignup = (firstName,lastName)=>{
    return `<html>
  <head>
    <meta charset="UTF-8">
    <script src="script.js"></script>
  </head>
  <body>
  <div style="padding: 2.5rem; 
  margin-top: 1.25rem; 
  text-align: center; 
  max-width: 28rem; 
  border-radius: 0.25rem; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  ">
      <img style="margin-top: 2.5rem; width: 50%; margin: 0 auto;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4ODcuMDggMTk0LjMiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojMDI0ZWE2O30uY2xzLTJ7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz48ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj48ZyBpZD0iTGF5ZXJfMS0yIiBkYXRhLW5hbWU9IkxheWVyIDEiPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgMzIuMzMgMTEyIDk2Ljk5IDExMS43MyA5Ny4xNSA1NiA2NC45NyAwLjI3IDk3LjE1IDAgOTYuOTkgMCAzMi4zMyAwLjA2IDMyLjMgNTYgMCAxMTIgMzIuMzMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMTExLjczIDk3LjE1IDU2IDEyOS4zMyAwLjI3IDk3LjE1IDU2IDY0Ljk3IDExMS43MyA5Ny4xNSIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgOTcuMyAxMTIgMTYxLjk3IDU2IDE5NC4zIDAgMTYxLjk3IDAgOTcuMyAwLjA2IDk3LjI3IDAuMjcgOTcuMTUgNTYgMTI5LjMzIDExMS43MyA5Ny4xNSAxMTIgOTcuMyIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzMi4zNiw3Ny4zNmEyMy44OSwyMy44OSwwLDAsMC03LjU3LTUuMSwyMy4yNywyMy4yNywwLDAsMC05LjI4LTEuODUsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3LDIyLjMzLDIyLjMzLDAsMCwwLTEuNzQsOC45MSwyMC4wOCwyMC4wOCwwLDAsMCwxLjg1LDguNiwyMS4wNywyMS4wNywwLDAsMCw1LDYuODMsMjMuODgsMjMuODgsMCwwLDAsNy4yNiw0LjQ4LDIzLjU2LDIzLjU2LDAsMCwwLDguNjYsMS42MkEyMi4zMiwyMi4zMiwwLDAsMCwyMjYsMTExLjY2YTIzLjY5LDIzLjY5LDAsMCwwLDgtNi41NWw1LjE4LDdhMzEuODUsMzEuODUsMCwwLDEtMTAuNDgsNy42NiwzMi4yNCwzMi4yNCwwLDAsMS0yNS4zMS4zOCwzMC4yNywzMC4yNywwLDAsMS0xNi4zOC0xNi40MiwzMC44OCwzMC44OCwwLDAsMS0yLjQtMTIuMThBMjcuODUsMjcuODUsMCwwLDEsMTg3LDc5LjhhMjkuNjksMjkuNjksMCwwLDEsNi44LTkuNDMsMzIuMDcsMzIuMDcsMCwwLDEsMjEuNzYtOC40NiwzMC42NSwzMC42NSwwLDAsMSwxMi4yNSwyLjQzQTMxLjI4LDMxLjI4LDAsMCwxLDIzNy43Nyw3MVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNzcuNTMsOTcuMzhIMjcwLjhhMzUuMzcsMzUuMzcsMCwwLDAtNS41NC40MywxNy4xLDE3LjEsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxSDI4MS44YTIyLjQxLDIyLjQxLDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSwyOTQuODQsNjhhMTQuODEsMTQuODEsMCwwLDEsMy44LDUuMzNBMTguMywxOC4zLDAsMCwxLDMwMCw4MC42MWExNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjA4LDE4LjA4LDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLjQ1LDEzLjQ1LDAsMCwwLDIsMiw1LjQ4LDUuNDgsMCwwLDAsMS45NSwxLDksOSwwLDAsMCwyLjQyLjI3bDIuNy0uMDh2OC41OGMtMS42NSwwLTMuMzEtLjA1LTUtLjE1YTE3LjEyLDE3LjEyLDAsMCwxLTQuODQtMSwxMy42MiwxMy42MiwwLDAsMS00LjQxLTIuNywxNi4zNSwxNi4zNSwwLDAsMS0zLjcyLTUuMjZabS0xNy42NS02LjI0YTEzLjg4LDEzLjg4LDAsMCwxLDUuMzMtMS45MSw0My4xMiw0My4xMiwwLDAsMSw1LjU2LS4zNWgxMWExMS40MiwxMS40MiwwLDAsMCw3LjExLTIuMDdjMS44LTEuMzgsMi43MS0zLjYsMi43MS02LjY2YTguMzcsOC4zNywwLDAsMC0uNzgtMy43NSw2Ljc4LDYuNzgsMCwwLDAtMi4wOC0yLjQ5LDguNTgsOC41OCwwLDAsMC0zLjEtMS4zOCwxNi42NywxNi42NywwLDAsMC0zLjg2LS40MkgyNTkuODhaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzM0LDg5YTc1LjU0LDc1LjU0LDAsMCwwLDkuNDctMTIuMDYsNjkuOTEsNjkuOTEsMCwwLDAsNi41Ny0xMy4yOWg5LjY2YTEwNy41LDEwNy41LDAsMCwxLTkuNTUsMTcuNywxMjIuMSwxMjIuMSwwLDAsMS0xMS45NCwxNXYyNWgtOC40MnYtMjVhMTIxLjUyLDEyMS41MiwwLDAsMS0xMS45NS0xNSwxMDYuNjQsMTA2LjY0LDAsMCwxLTkuNTQtMTcuN0gzMThhNjkuMTIsNjkuMTIsMCwwLDAsNi41NywxMy4zQTc1LDc1LDAsMCwwLDMzNCw4OVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zNzAuMDksMTIxLjI2VjYzLjYxaDI5LjY1YTIwLjM4LDIwLjM4LDAsMCwxLDYuOTMsMS4xMkExNC42MiwxNC42MiwwLDAsMSw0MTIsNjhhMTQuNDUsMTQuNDUsMCwwLDEsMy40LDUuMTgsMjAuNTUsMjAuNTUsMCwwLDEsMCwxMy44NEExNS4xMiwxNS4xMiwwLDAsMSw0MTIsOTIuMjRhMTQuNDUsMTQuNDUsMCwwLDEtNS4zNCwzLjM2LDE5LjcxLDE5LjcxLDAsMCwxLTYuOTMsMS4xNkgzODkuNTFhMzMuNTksMzMuNTksMCwwLDAtNS41Ny40NywxNy44NCwxNy44NCwwLDAsMC01LjQyLDEuODV2MjIuMThabTI5LjYxLTMzcTguNDksMCw4LjUtOC4xNSwwLTQuMzktMi4xNy02LjE5dC02LjMzLTEuODFIMzc4LjUyVjkwLjU4YTE0LjU2LDE0LjU2LDAsMCwxLDUuMzctMS45Myw0MC40NCw0MC40NCwwLDAsMSw1LjYtLjM5WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ1MS40OCw3Mi4xMXY0OS4xNWgtOC4xOVY3Mi4xMUg0MjIuNzN2LTguNWg0OS4wOHY4LjVaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQwLjksOTIuNTFhMjguMjUsMjguMjUsMCwwLDEtMi41MSwxMS45MSwzMC4zOSwzMC4zOSwwLDAsMS02Ljc3LDkuNSwzMiwzMiwwLDAsMS0zNC4wNSw2LjI2LDMwLjc0LDMwLjc0LDAsMCwxLTE4LjgxLTI4LjYsMjgsMjgsMCwwLDEsMi41MS0xMS43OCwyOS43NSwyOS43NSwwLDAsMSw2LjgyLTkuNDMsMzIuMTEsMzIuMTEsMCwwLDEsMjEuNzgtOC40NywzMS4yNSwzMS4yNSwwLDAsMSwyMS45NCw4Ljg1LDMwLjc4LDMwLjc4LDAsMCwxLDYuNjUsOS43QTI5LjYzLDI5LjYzLDAsMCwxLDU0MC45LDkyLjUxWm0tOC40Mi0uNWEyMC42MiwyMC42MiwwLDAsMC0xLjgyLTguNjgsMjEuMjksMjEuMjksMCwwLDAtNC45NC02Ljg3QTIyLjU2LDIyLjU2LDAsMCwwLDUxOC40OSw3MmEyMy45NCwyMy45NCwwLDAsMC04Ljc0LTEuNTgsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3QTIyLjUsMjIuNSwwLDAsMCw0ODcsOTIuNTVhMjAuMDksMjAuMDksMCwwLDAsMS44Niw4LjYsMjAuOSwyMC45LDAsMCwwLDUsNi44MywyMy44MSwyMy44MSwwLDAsMCw3LjI3LDQuNDgsMjMuNDYsMjMuNDYsMCwwLDAsOC42NSwxLjYyLDIyLjksMjIuOSwwLDAsMCw4Ljc3LTEuNywyMi4yNCwyMi4yNCwwLDAsMCw3LjE5LTQuNjcsMjIuNzUsMjIuNzUsMCwwLDAsNC44Ny03QTIwLjgsMjAuOCwwLDAsMCw1MzIuNDgsOTJaIi8+PHBhdGggZD0iTTU0Ny40Nyw2My42MWgxMC45bDM3LDQ0LjA1di00NGg4LjQzdjU3LjY1aC04LjM0bC0zMy0zOS42NXYzOS42NUg1NTQuMlY3MS43MloiLz48cGF0aCBkPSJNNjM1Ljc0LDYyLjZINjQ1bDI3Ljc1LDU4LjY2aC05LjQzbC0zLjc5LTguNDJINjQyYTQxLDQxLDAsMCwwLTcsLjU0LDI3LjYyLDI3LjYyLDAsMCwwLTUuMjEsMS4zOSwxNC4zOSwxNC4zOSwwLDAsMC0zLjQ4LDEuODYsNS44Nyw1Ljg3LDAsMCwwLTEuNzgsMS45M2wtMS40NywyLjdoLTkuMTJsMjUtNTEuNTVabTIwLDQxLjc0TDY0My4xNiw4MCw2MzAuNCwxMDcuNThhMTMuNzMsMTMuNzMsMCwwLDEsNS4xLTIuMjgsMzguMjQsMzguMjQsMCwwLDEsOS41OS0xWiIvPjxwYXRoIGQ9Ik03MDgsMTIyLjU4cS0xMi4zNywwLTE5LjE2LTYuMTh0LTYuNzctMTcuNTVWNjMuNjFoOC40M1Y5OC44cTAsNy40OSw0LjU1LDExLjM4dDEyLjk1LDMuOXE4LjQxLDAsMTMtMy45dDQuNTUtMTEuMzhWNjMuNjFINzM0Vjk4Ljg1cTAsMTEuMzYtNi43NywxNy41NVQ3MDgsMTIyLjU4WiIvPjxwYXRoIGQ9Ik03NTguNTUsMTIxLjI2aC04LjQyVjYzLjYxaDguNDJ2NDMuMDVsMjkuMjktNDNINzk4TDc3OSw5MC43M2wxMC4zNiwxNS41NGExNy42MSwxNy42MSwwLDAsMCw0LjkxLDUuMzMsNi44Miw2LjgyLDAsMCwwLDQuMDYsMS4xNmwyLjM5LS4wN3Y4LjU3aC0zYTI4Ljg1LDI4Ljg1LDAsMCwxLTMuODMtLjIzLDEwLjgsMTAuOCwwLDAsMS0zLjU5LTEuMTIsMTQuNiwxNC42LDAsMCwxLTMuNjMtMi43LDI2LjQ4LDI2LjQ4LDAsMCwxLTMuODctNS4wN2wtOC43My0xNFoiLz48cGF0aCBkPSJNODQwLDk3LjM4aC02Ljc0YTM1LjM0LDM1LjM0LDAsMCwwLTUuNTMuNDMsMTYuOTMsMTYuOTMsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxaDMwLjM1YTIyLjQ1LDIyLjQ1LDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSw4NTcuMjgsNjhhMTQuNzgsMTQuNzgsMCwwLDEsMy43OSw1LjMzLDE4LjQ5LDE4LjQ5LDAsMCwxLDEuMzYsNy4yNywxNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjEyLDE4LjEyLDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLDEzLDAsMCwwLDEuOTUsMiw1LjQsNS40LDAsMCwwLDIsMSw4LjkyLDguOTIsMCwwLDAsMi40MS4yN2wyLjcxLS4wOHY4LjU4Yy0xLjY1LDAtMy4zMS0uMDUtNS0uMTVhMTcsMTcsMCwwLDEtNC44NC0xLDEzLjc3LDEzLjc3LDAsMCwxLTQuNDItMi43LDE2LjQ4LDE2LjQ4LDAsMCwxLTMuNzEtNS4yNlptLTE3LjY1LTYuMjRhMTMuODgsMTMuODgsMCwwLDEsNS4zMy0xLjkxLDQzLDQzLDAsMCwxLDUuNTYtLjM1aDExYTExLjQzLDExLjQzLDAsMCwwLDcuMTEtMi4wN3EyLjctMi4wNywyLjctNi42NmE4LjIzLDguMjMsMCwwLDAtLjc3LTMuNzUsNi43MSw2LjcxLDAsMCwwLTIuMDktMi40OSw4LjQ2LDguNDYsMCwwLDAtMy4wOS0xLjM4LDE2LjY3LDE2LjY3LDAsMCwwLTMuODYtLjQySDgyMi4zMloiLz48cGF0aCBkPSJNODc4LjgxLDEyMS4yNlY2My42MWg4LjI3djU3LjY1WiIvPjwvZz48L2c+PC9zdmc+" />
    
    
    <p style="margin-top: 2.5rem; color: #374151; ">
      Hey There , <b>${firstName} ${lastName}</b>
      <br/>
      <p style="margin-top: 0.5em">Thank You for applying at CryptoNaukri </p>
      <br/> 
      <span style="color: #4B5563; 
  font-size: 0.75rem;
  line-height: 1rem;">You can reach out to me at <span style="color: #EF4444;">founder@cryptonaukri.com</span></span>
    </p>
    <br/><br/>
    <span style="color: #9CA3AF; 
  font-size: 0.75rem;
  line-height: 1rem; ">if you did not expect this message, simply ignore this.</span>
    <p class="mt-6 text-xs text-left">
      Sent by <a style="color: #2563EB; 
  text-decoration: underline; " href="https://www.cryptonaukri.com/">CryptoNaukri</a>
    </p>
  <div style="display: flex; 
  margin-top: 0.75rem; 
  display: flex; 
  justify-content: flex-start; 
  gap: 0.5rem; ">
      <a href="https://www.instagram.com/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RmFjZWJvb2s8L3RpdGxlPjxwYXRoIGQ9Ik0yNCAxMi4wNzNjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTJjMCA1Ljk5IDQuMzg4IDEwLjk1NCAxMC4xMjUgMTEuODU0di04LjM4NUg3LjA3OHYtMy40N2gzLjA0N1Y5LjQzYzAtMy4wMDcgMS43OTItNC42NjkgNC41MzMtNC42NjkgMS4zMTIgMCAyLjY4Ni4yMzUgMi42ODYuMjM1djIuOTUzSDE1LjgzYy0xLjQ5MSAwLTEuOTU2LjkyNS0xLjk1NiAxLjg3NHYyLjI1aDMuMzI4bC0uNTMyIDMuNDdoLTIuNzk2djguMzg1QzE5LjYxMiAyMy4wMjcgMjQgMTguMDYyIDI0IDEyLjA3M3oiLz48L3N2Zz4=" />
      </a>
      <a href="">
        <img style="width: 1.25rem;" src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R21haWw8L3RpdGxlPjxwYXRoIGQ9Ik0yNCA1LjQ1N3YxMy45MDljMCAuOTA0LS43MzIgMS42MzYtMS42MzYgMS42MzZoLTMuODE5VjExLjczTDEyIDE2LjY0bC02LjU0NS00LjkxdjkuMjczSDEuNjM2QTEuNjM2IDEuNjM2IDAgMCAxIDAgMTkuMzY2VjUuNDU3YzAtMi4wMjMgMi4zMDktMy4xNzggMy45MjctMS45NjRMNS40NTUgNC42NCAxMiA5LjU0OGw2LjU0NS00LjkxIDEuNTI4LTEuMTQ1QzIxLjY5IDIuMjggMjQgMy40MzQgMjQgNS40NTd6Ii8+PC9zdmc+" />
      </a>
      <a href="https://www.linkedin.com/company/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TGlua2VkSW48L3RpdGxlPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==" />
      </a>
      <a href="">
    </div>
  </div>
  </body>
</html>`;
}

const emailTemplateJobApply = (firstName , lastName , jobDetail , companyName) => {
  return `<html>
  <head>
    <meta charset="UTF-8">
    <script src="script.js"></script>
  </head>
  <body>
  <div style="padding: 2.5rem; 
  margin-top: 1.25rem; 
  text-align: center; 
  max-width: 28rem; 
  border-radius: 0.25rem; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  ">
    <img style="margin-top: 2.5rem; width: 50%; margin: 0 auto;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4ODcuMDggMTk0LjMiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojMDI0ZWE2O30uY2xzLTJ7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz48ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj48ZyBpZD0iTGF5ZXJfMS0yIiBkYXRhLW5hbWU9IkxheWVyIDEiPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgMzIuMzMgMTEyIDk2Ljk5IDExMS43MyA5Ny4xNSA1NiA2NC45NyAwLjI3IDk3LjE1IDAgOTYuOTkgMCAzMi4zMyAwLjA2IDMyLjMgNTYgMCAxMTIgMzIuMzMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMTExLjczIDk3LjE1IDU2IDEyOS4zMyAwLjI3IDk3LjE1IDU2IDY0Ljk3IDExMS43MyA5Ny4xNSIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgOTcuMyAxMTIgMTYxLjk3IDU2IDE5NC4zIDAgMTYxLjk3IDAgOTcuMyAwLjA2IDk3LjI3IDAuMjcgOTcuMTUgNTYgMTI5LjMzIDExMS43MyA5Ny4xNSAxMTIgOTcuMyIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzMi4zNiw3Ny4zNmEyMy44OSwyMy44OSwwLDAsMC03LjU3LTUuMSwyMy4yNywyMy4yNywwLDAsMC05LjI4LTEuODUsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3LDIyLjMzLDIyLjMzLDAsMCwwLTEuNzQsOC45MSwyMC4wOCwyMC4wOCwwLDAsMCwxLjg1LDguNiwyMS4wNywyMS4wNywwLDAsMCw1LDYuODMsMjMuODgsMjMuODgsMCwwLDAsNy4yNiw0LjQ4LDIzLjU2LDIzLjU2LDAsMCwwLDguNjYsMS42MkEyMi4zMiwyMi4zMiwwLDAsMCwyMjYsMTExLjY2YTIzLjY5LDIzLjY5LDAsMCwwLDgtNi41NWw1LjE4LDdhMzEuODUsMzEuODUsMCwwLDEtMTAuNDgsNy42NiwzMi4yNCwzMi4yNCwwLDAsMS0yNS4zMS4zOCwzMC4yNywzMC4yNywwLDAsMS0xNi4zOC0xNi40MiwzMC44OCwzMC44OCwwLDAsMS0yLjQtMTIuMThBMjcuODUsMjcuODUsMCwwLDEsMTg3LDc5LjhhMjkuNjksMjkuNjksMCwwLDEsNi44LTkuNDMsMzIuMDcsMzIuMDcsMCwwLDEsMjEuNzYtOC40NiwzMC42NSwzMC42NSwwLDAsMSwxMi4yNSwyLjQzQTMxLjI4LDMxLjI4LDAsMCwxLDIzNy43Nyw3MVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNzcuNTMsOTcuMzhIMjcwLjhhMzUuMzcsMzUuMzcsMCwwLDAtNS41NC40MywxNy4xLDE3LjEsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxSDI4MS44YTIyLjQxLDIyLjQxLDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSwyOTQuODQsNjhhMTQuODEsMTQuODEsMCwwLDEsMy44LDUuMzNBMTguMywxOC4zLDAsMCwxLDMwMCw4MC42MWExNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjA4LDE4LjA4LDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLjQ1LDEzLjQ1LDAsMCwwLDIsMiw1LjQ4LDUuNDgsMCwwLDAsMS45NSwxLDksOSwwLDAsMCwyLjQyLjI3bDIuNy0uMDh2OC41OGMtMS42NSwwLTMuMzEtLjA1LTUtLjE1YTE3LjEyLDE3LjEyLDAsMCwxLTQuODQtMSwxMy42MiwxMy42MiwwLDAsMS00LjQxLTIuNywxNi4zNSwxNi4zNSwwLDAsMS0zLjcyLTUuMjZabS0xNy42NS02LjI0YTEzLjg4LDEzLjg4LDAsMCwxLDUuMzMtMS45MSw0My4xMiw0My4xMiwwLDAsMSw1LjU2LS4zNWgxMWExMS40MiwxMS40MiwwLDAsMCw3LjExLTIuMDdjMS44LTEuMzgsMi43MS0zLjYsMi43MS02LjY2YTguMzcsOC4zNywwLDAsMC0uNzgtMy43NSw2Ljc4LDYuNzgsMCwwLDAtMi4wOC0yLjQ5LDguNTgsOC41OCwwLDAsMC0zLjEtMS4zOCwxNi42NywxNi42NywwLDAsMC0zLjg2LS40MkgyNTkuODhaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzM0LDg5YTc1LjU0LDc1LjU0LDAsMCwwLDkuNDctMTIuMDYsNjkuOTEsNjkuOTEsMCwwLDAsNi41Ny0xMy4yOWg5LjY2YTEwNy41LDEwNy41LDAsMCwxLTkuNTUsMTcuNywxMjIuMSwxMjIuMSwwLDAsMS0xMS45NCwxNXYyNWgtOC40MnYtMjVhMTIxLjUyLDEyMS41MiwwLDAsMS0xMS45NS0xNSwxMDYuNjQsMTA2LjY0LDAsMCwxLTkuNTQtMTcuN0gzMThhNjkuMTIsNjkuMTIsMCwwLDAsNi41NywxMy4zQTc1LDc1LDAsMCwwLDMzNCw4OVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zNzAuMDksMTIxLjI2VjYzLjYxaDI5LjY1YTIwLjM4LDIwLjM4LDAsMCwxLDYuOTMsMS4xMkExNC42MiwxNC42MiwwLDAsMSw0MTIsNjhhMTQuNDUsMTQuNDUsMCwwLDEsMy40LDUuMTgsMjAuNTUsMjAuNTUsMCwwLDEsMCwxMy44NEExNS4xMiwxNS4xMiwwLDAsMSw0MTIsOTIuMjRhMTQuNDUsMTQuNDUsMCwwLDEtNS4zNCwzLjM2LDE5LjcxLDE5LjcxLDAsMCwxLTYuOTMsMS4xNkgzODkuNTFhMzMuNTksMzMuNTksMCwwLDAtNS41Ny40NywxNy44NCwxNy44NCwwLDAsMC01LjQyLDEuODV2MjIuMThabTI5LjYxLTMzcTguNDksMCw4LjUtOC4xNSwwLTQuMzktMi4xNy02LjE5dC02LjMzLTEuODFIMzc4LjUyVjkwLjU4YTE0LjU2LDE0LjU2LDAsMCwxLDUuMzctMS45Myw0MC40NCw0MC40NCwwLDAsMSw1LjYtLjM5WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ1MS40OCw3Mi4xMXY0OS4xNWgtOC4xOVY3Mi4xMUg0MjIuNzN2LTguNWg0OS4wOHY4LjVaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQwLjksOTIuNTFhMjguMjUsMjguMjUsMCwwLDEtMi41MSwxMS45MSwzMC4zOSwzMC4zOSwwLDAsMS02Ljc3LDkuNSwzMiwzMiwwLDAsMS0zNC4wNSw2LjI2LDMwLjc0LDMwLjc0LDAsMCwxLTE4LjgxLTI4LjYsMjgsMjgsMCwwLDEsMi41MS0xMS43OCwyOS43NSwyOS43NSwwLDAsMSw2LjgyLTkuNDMsMzIuMTEsMzIuMTEsMCwwLDEsMjEuNzgtOC40NywzMS4yNSwzMS4yNSwwLDAsMSwyMS45NCw4Ljg1LDMwLjc4LDMwLjc4LDAsMCwxLDYuNjUsOS43QTI5LjYzLDI5LjYzLDAsMCwxLDU0MC45LDkyLjUxWm0tOC40Mi0uNWEyMC42MiwyMC42MiwwLDAsMC0xLjgyLTguNjgsMjEuMjksMjEuMjksMCwwLDAtNC45NC02Ljg3QTIyLjU2LDIyLjU2LDAsMCwwLDUxOC40OSw3MmEyMy45NCwyMy45NCwwLDAsMC04Ljc0LTEuNTgsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3QTIyLjUsMjIuNSwwLDAsMCw0ODcsOTIuNTVhMjAuMDksMjAuMDksMCwwLDAsMS44Niw4LjYsMjAuOSwyMC45LDAsMCwwLDUsNi44MywyMy44MSwyMy44MSwwLDAsMCw3LjI3LDQuNDgsMjMuNDYsMjMuNDYsMCwwLDAsOC42NSwxLjYyLDIyLjksMjIuOSwwLDAsMCw4Ljc3LTEuNywyMi4yNCwyMi4yNCwwLDAsMCw3LjE5LTQuNjcsMjIuNzUsMjIuNzUsMCwwLDAsNC44Ny03QTIwLjgsMjAuOCwwLDAsMCw1MzIuNDgsOTJaIi8+PHBhdGggZD0iTTU0Ny40Nyw2My42MWgxMC45bDM3LDQ0LjA1di00NGg4LjQzdjU3LjY1aC04LjM0bC0zMy0zOS42NXYzOS42NUg1NTQuMlY3MS43MloiLz48cGF0aCBkPSJNNjM1Ljc0LDYyLjZINjQ1bDI3Ljc1LDU4LjY2aC05LjQzbC0zLjc5LTguNDJINjQyYTQxLDQxLDAsMCwwLTcsLjU0LDI3LjYyLDI3LjYyLDAsMCwwLTUuMjEsMS4zOSwxNC4zOSwxNC4zOSwwLDAsMC0zLjQ4LDEuODYsNS44Nyw1Ljg3LDAsMCwwLTEuNzgsMS45M2wtMS40NywyLjdoLTkuMTJsMjUtNTEuNTVabTIwLDQxLjc0TDY0My4xNiw4MCw2MzAuNCwxMDcuNThhMTMuNzMsMTMuNzMsMCwwLDEsNS4xLTIuMjgsMzguMjQsMzguMjQsMCwwLDEsOS41OS0xWiIvPjxwYXRoIGQ9Ik03MDgsMTIyLjU4cS0xMi4zNywwLTE5LjE2LTYuMTh0LTYuNzctMTcuNTVWNjMuNjFoOC40M1Y5OC44cTAsNy40OSw0LjU1LDExLjM4dDEyLjk1LDMuOXE4LjQxLDAsMTMtMy45dDQuNTUtMTEuMzhWNjMuNjFINzM0Vjk4Ljg1cTAsMTEuMzYtNi43NywxNy41NVQ3MDgsMTIyLjU4WiIvPjxwYXRoIGQ9Ik03NTguNTUsMTIxLjI2aC04LjQyVjYzLjYxaDguNDJ2NDMuMDVsMjkuMjktNDNINzk4TDc3OSw5MC43M2wxMC4zNiwxNS41NGExNy42MSwxNy42MSwwLDAsMCw0LjkxLDUuMzMsNi44Miw2LjgyLDAsMCwwLDQuMDYsMS4xNmwyLjM5LS4wN3Y4LjU3aC0zYTI4Ljg1LDI4Ljg1LDAsMCwxLTMuODMtLjIzLDEwLjgsMTAuOCwwLDAsMS0zLjU5LTEuMTIsMTQuNiwxNC42LDAsMCwxLTMuNjMtMi43LDI2LjQ4LDI2LjQ4LDAsMCwxLTMuODctNS4wN2wtOC43My0xNFoiLz48cGF0aCBkPSJNODQwLDk3LjM4aC02Ljc0YTM1LjM0LDM1LjM0LDAsMCwwLTUuNTMuNDMsMTYuOTMsMTYuOTMsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxaDMwLjM1YTIyLjQ1LDIyLjQ1LDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSw4NTcuMjgsNjhhMTQuNzgsMTQuNzgsMCwwLDEsMy43OSw1LjMzLDE4LjQ5LDE4LjQ5LDAsMCwxLDEuMzYsNy4yNywxNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjEyLDE4LjEyLDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLDEzLDAsMCwwLDEuOTUsMiw1LjQsNS40LDAsMCwwLDIsMSw4LjkyLDguOTIsMCwwLDAsMi40MS4yN2wyLjcxLS4wOHY4LjU4Yy0xLjY1LDAtMy4zMS0uMDUtNS0uMTVhMTcsMTcsMCwwLDEtNC44NC0xLDEzLjc3LDEzLjc3LDAsMCwxLTQuNDItMi43LDE2LjQ4LDE2LjQ4LDAsMCwxLTMuNzEtNS4yNlptLTE3LjY1LTYuMjRhMTMuODgsMTMuODgsMCwwLDEsNS4zMy0xLjkxLDQzLDQzLDAsMCwxLDUuNTYtLjM1aDExYTExLjQzLDExLjQzLDAsMCwwLDcuMTEtMi4wN3EyLjctMi4wNywyLjctNi42NmE4LjIzLDguMjMsMCwwLDAtLjc3LTMuNzUsNi43MSw2LjcxLDAsMCwwLTIuMDktMi40OSw4LjQ2LDguNDYsMCwwLDAtMy4wOS0xLjM4LDE2LjY3LDE2LjY3LDAsMCwwLTMuODYtLjQySDgyMi4zMloiLz48cGF0aCBkPSJNODc4LjgxLDEyMS4yNlY2My42MWg4LjI3djU3LjY1WiIvPjwvZz48L2c+PC9zdmc+" />
    <h1 style="margin-top: 1rem; color: #4B5563; font-size: 1.25rem;line-height: 1.75rem; font-weight: 600; ">Application Update</h1><br/>
    
    <p style="margin-top: 0.5rem; color: #374151; ">${firstName} ${lastName} has applied for ${jobDetail} at ${companyName}</p>
      <span style="color: #4B5563; 
  font-size: 0.75rem;
  line-height: 1rem;">You have <span style="color: #EF4444; ">10 Minutes</span> to validate this OTP</span>
    </p>
    
    <span style="color: #9CA3AF; 
  font-size: 0.75rem;
  line-height: 1rem; ">if you did not expect this message, simply ignore this.</span>
    <p class="mt-6 text-xs text-left">
      Sent by <a style="color: #2563EB; 
  text-decoration: underline; " href="https://www.cryptonaukri.com/">CryptoNaukri</a>
    </p>
  <div style="display: flex; 
  margin-top: 0.75rem; 
  display: flex; 
  justify-content: flex-start; 
  gap: 0.5rem; ">
      <a href="https://www.instagram.com/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RmFjZWJvb2s8L3RpdGxlPjxwYXRoIGQ9Ik0yNCAxMi4wNzNjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTJjMCA1Ljk5IDQuMzg4IDEwLjk1NCAxMC4xMjUgMTEuODU0di04LjM4NUg3LjA3OHYtMy40N2gzLjA0N1Y5LjQzYzAtMy4wMDcgMS43OTItNC42NjkgNC41MzMtNC42NjkgMS4zMTIgMCAyLjY4Ni4yMzUgMi42ODYuMjM1djIuOTUzSDE1LjgzYy0xLjQ5MSAwLTEuOTU2LjkyNS0xLjk1NiAxLjg3NHYyLjI1aDMuMzI4bC0uNTMyIDMuNDdoLTIuNzk2djguMzg1QzE5LjYxMiAyMy4wMjcgMjQgMTguMDYyIDI0IDEyLjA3M3oiLz48L3N2Zz4=" />
      </a>
      <a href="">
        <img style="width: 1.25rem;" src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R21haWw8L3RpdGxlPjxwYXRoIGQ9Ik0yNCA1LjQ1N3YxMy45MDljMCAuOTA0LS43MzIgMS42MzYtMS42MzYgMS42MzZoLTMuODE5VjExLjczTDEyIDE2LjY0bC02LjU0NS00LjkxdjkuMjczSDEuNjM2QTEuNjM2IDEuNjM2IDAgMCAxIDAgMTkuMzY2VjUuNDU3YzAtMi4wMjMgMi4zMDktMy4xNzggMy45MjctMS45NjRMNS40NTUgNC42NCAxMiA5LjU0OGw2LjU0NS00LjkxIDEuNTI4LTEuMTQ1QzIxLjY5IDIuMjggMjQgMy40MzQgMjQgNS40NTd6Ii8+PC9zdmc+" />
      </a>
      <a href="https://www.linkedin.com/company/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TGlua2VkSW48L3RpdGxlPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==" />
      </a>
      <a href="">
    </div>
  </div>
  </body>
</html>`
};


