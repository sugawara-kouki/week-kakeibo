"use server";

import { auth } from "@clerk/nextjs/server";

/**
 * 現在認証されているユーザーIDを取得
 * @throws {Error} ユーザーが認証されていない場合
 * @returns {Promise<string>} ユーザーID
 */
export async function getCurrentUserId(): Promise<string> {
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }
  return userObj.userId;
}
