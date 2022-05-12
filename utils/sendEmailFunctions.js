const nodemailer = require("nodemailer");
exports.sendEmailAfterJobApply = async ({officialEmail,companyName},{firstName , lastName},jobTitle)=>{
    const transporter = nodemailer.createTransport({
        service : "smtp",
        host : process.env.EMAIL_HOST,
        name :process.env.EMAIL_NAME,
        port : process.env.EMAIL_PORT,
        secure : true ,
        auth : {
            user : process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: officialEmail,
        subject: `A Candidate has applied to ${companyName}`,
        html: emailTemplate(firstName,lastName,jobTitle,companyName)
    }
    transporter.sendMail(mailOptions,(err,data)=>{
        if(err)
            console.log(err);
    });
}

//
const emailTemplate = (firstName , lastName , jobDetail , companyName) => {
  return `\`<div style="padding: 2.5rem; 
margin-top: 1.25rem; 
text-align: center; 
max-width: 28rem; 
border-radius: 0.25rem; 
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
margin: 0 auto;
">
  <h1 style="margin-top: 1rem; color: #4B5563; font-size: 1.25rem;line-height: 1.75rem; font-weight: 600; ">Application Update</h1><br/>
  
  <p style="margin-top: 1rem; color: #374151; ">${firstName} ${lastName} has for ${jobDetail} at ${companyName}</p>
  
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
  </div>
</div>`
};


