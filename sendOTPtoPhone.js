import fast2sms from "fast-two-sms";

export async function sendOTPtoPhone(data) {
  console.log(fast2sms);
  var options = {
    authorization: process.env.SMS_API_KEY,
    message: `Dear Sir/Madam
    Tamil Selvan app OTP is ${data.phone_otp}`,
    numbers: [`${data.number}`],
    sender_id: "OTP-MANAGER",
  };
  fast2sms.sendMessage(options).then((response) => {
    console.log(response);
  });
}
