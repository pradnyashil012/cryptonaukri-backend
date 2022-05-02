const otpTemplate = (otp,actionIndex) =>{
    const arr = ["OTP To Change Your Password","Thank you for registering, use the above verification code to verify your email address."]

    return `<div style="padding: 2.5rem; 
margin-top: 1.25rem; 
text-align: center; 
max-width: 28rem; 
border-radius: 0.25rem; 
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
margin: 0 auto;
">
  <img style="margin-top: 2.5rem; width: 50%; margin: 0 auto;" src="https://www.cryptonaukri.com/img/logo.svg" />
  <h1 style="margin-top: 1rem; color: #4B5563; font-size: 1.25rem;line-height: 1.75rem; font-weight: 600; ">Verfication Code</h1><br/>
  <span style="padding: 0.25rem; 
padding-left: 1rem;
padding-right: 1rem; 
margin-top: 10rem; 
background-color: #F3F4F6; 
color: #1E40AF; 
font-size: 1.5rem;
line-height: 2rem; 
font-weight: 600; 
border-radius: 0.35rem; 
border-radius: 9999px; ">${otp}</span>
  
  <p style="margin-top: 2.5rem; color: #374151; ">${arr[actionIndex]} <br/><br/>
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
    <a href="">
      <img style="width: 1.25rem; " src="https://simpleicons.org/icons/facebook.svg">
    </a>
    <a href="">
      <img style="width: 1.25rem; " src="https://simpleicons.org/icons/gmail.svg">
    </a>
    <a href="">
    <img style="width: 1.25rem; " src="https://simpleicons.org/icons/linkedin.svg">
    </a>
    <a href="">
  </div>
</div>`
};

module.exports = otpTemplate;