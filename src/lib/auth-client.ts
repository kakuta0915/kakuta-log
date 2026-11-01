// ブラウザ側（クライアント側）で Better Auth の認証機能を使うための設定
"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Better Auth が提供する createAuthClient 関数を使って、ブラウザ側で Better Auth の認証機能を使うためのクライアントを作成できる。
// 認証クライアントとは、ブラウザから Better Auth に認証処理をお願いするための窓口。
