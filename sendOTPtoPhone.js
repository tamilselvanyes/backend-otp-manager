import unirest from "unirest";

const req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

export async function sendOTPtoPhone(data) {
  req.query({
    authorization: process.env.SMS_API_KEY,
    variables_values: `${data.phone_otp}`,
    route: "otp",
    numbers: `${data.number}`,
  });

  req.headers({
    "cache-control": "no-cache",
  });

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    return res.body.return;
  });
}
