import Vonage from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: "6f011495",
  apiSecret: "fJgjEPKTD1R1S6db",
});

export function sendOTPtoPhone(data) {
  const from = "Vonage APIs";
  const to = data.number;
  const text = `Tamil Selvan App OTP is ${data.phone_otp}`;

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
}
