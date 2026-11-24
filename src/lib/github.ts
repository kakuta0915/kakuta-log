import { HttpError } from "./errors";
import type { GhCommit, GhDay } from "./types";

// GitHub API にリクエストを送る際に必要なヘッダー情報を作成
function headers(): HeadersInit {
  const h: Record<string, string> = {
    // 受け取りたいデータの形式を指定
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN)
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

// 直近 1 年のコントリビューション（トークン不要の公開 API を利用）
export async function fetchContributions(): Promise<GhDay[]> {
  const user = process.env.GITHUB_USERNAME!;
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`,
    {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok) throw new HttpError(res.status);

  const json = (await res.json()) as { contributions: GhDay[] };
  return json.contributions;
}

// 指定された日付のコミット情報を取得
export async function fetchCommitsOfDay(date: string): Promise<GhCommit[]> {
  const user = process.env.GITHUB_USERNAME!;
  const range = `${date}T00:00:00+09:00..${date}T23:59:59+09:00`;
  const q = `author:${user} author-date:${range}`;
  const res = await fetch(
    `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&sort=author-date&order=desc&per_page=50`,
    {
      headers: headers(),
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok) throw new HttpError(res.status);

  // API から取得したデータの形式を指定
  const json = (await res.json()) as {
    items: {
      sha: string;
      html_url: string;
      commit: { message: string; author: { date: string } };
      repository: { full_name: string; html_url: string };
    }[];
  };

  // アプリで使いやすい形式に変換;
  return json.items.map((i) => ({
    sha: i.sha.slice(0, 7),
    repo: i.repository.full_name,
    repoUrl: i.repository.html_url,
    url: i.html_url,
    message: i.commit.message.split("\n")[0],
    time: i.commit.author.date,
  }));
}

/* 補足
・!: TypeScript に対して「この値は undefined や null ではない」と伝える記号
・as { contributions: GhDay[] }: 取得したデータが指定した形式であると TypeScript に伝える型指定
・json.contributions を返すことで、コントリビューション情報だけを配列として取り出せる
・author:${user}: 指定したユーザーが作成者であるコミット。
・author-date:${range}: 指定した日時の範囲内に作成されたコミット。
*/
