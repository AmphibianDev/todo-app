import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";

const vonageClientSingleton = () => {
  const vonageAuth = new Auth({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: Buffer.from(process.env.VONAGE_APPLICATION_PRIVATE_KEY64 || "", "base64"),
  });

  return new Vonage(vonageAuth);
};

declare global {
  var vonage: undefined | ReturnType<typeof vonageClientSingleton>;
}

const vonage = globalThis.vonage ?? vonageClientSingleton();

export default vonage;

if (process.env.NODE_ENV !== "production") globalThis.vonage = vonage;
