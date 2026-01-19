import admin from "../../config/firebase";

export const sendPush = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  if (!token) return;

  await admin.messaging().send({
    token,
    notification: { title, body },
    data,
  });
};