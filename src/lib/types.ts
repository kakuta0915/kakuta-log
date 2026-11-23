import type { Ymd } from "./date";

export interface CategoryInfo {
  id: string;
  name: string;
  domain: string;
}

// アウトプット（microCMS）
export interface BlogArticle {
  id: string;
  title: string;
  domain: string;
  category: string;
  date: Ymd;
}

// 学習時間（学習時間 DB の 1 レコード）
export interface LearnSession {
  id: string;
  title: string;
  domain: string;
  category: string;
  date: Ymd;
  minutes: number;
}

// タスクの進捗状態を定義（配列の要素を変更できないようにする）
export const PROGRESS_ORDER = ["未着手", "進行中", "保留", "完了"] as const;
export type Progress = (typeof PROGRESS_ORDER)[number];

// 親タスクと子タスクに共通
export interface TaskBase {
  id: string;
  name: string;
  progress: string;
  priority: number;
  start?: Ymd;
  end?: Ymd;
  completed?: Ymd;
  category?: string;
  domain?: string;
}

// 子タスク（TaskBase の項目に親タスク ID を追加）
export interface ChildTask extends TaskBase {
  parentId?: string;
}

// 親タスク（TaskBase の項目に子タスク一覧を追加）
export interface ParentTask extends TaskBase {
  children: ChildTask[];
}

// 親・子を平坦化した行（期限リスト等で使用）
export interface FlatTask extends TaskBase {
  kind: "親" | "子";
  parentName?: string;
}

// GitHub の日別活動情報
export interface GhDay {
  date: Ymd;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

// GitHub のコミット情報
export interface GhCommit {
  sha: string;
  repo: string;
  repoUrl: string;
  url: string;
  message: string;
  time: string;
}
