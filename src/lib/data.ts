import { loadWith, type Loaded } from "./errors";
import { fetchBlogArticles } from "./microcms";
import { fetchLearnSessions, fetchTasks } from "./notion";
import { fetchContributions } from "./github";
import type { Ymd } from "./date";
import type { GhDay, BlogArticle, ParentTask, LearnSession } from "./types";

// ページから呼ぶサーバー側ローダー。
// 各 API からデータを取得し、失敗した場合はエラーとして扱う。
export function loadOutputs(today: Ymd): Promise<Loaded<BlogArticle[]>> {
  return loadWith("microCMS", () => fetchBlogArticles(today));
}

export function loadLearnSessions(today: Ymd): Promise<Loaded<LearnSession[]>> {
  return loadWith(
    "Notion(学習時間)",
    async () => (await fetchLearnSessions(today)).sessions,
  );
}

export function loadContributions(): Promise<Loaded<GhDay[]>> {
  return loadWith("GitHub", () => fetchContributions());
}

export function loadTasks(): Promise<Loaded<ParentTask[]>> {
  return loadWith("Notion(タスク)", () => fetchTasks());
}
