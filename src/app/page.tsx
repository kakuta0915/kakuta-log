import {
  loadOutputs,
  loadLearnSessions,
  loadContributions,
  loadTasks,
} from "@/lib/data";
import type { Ymd } from "@/lib/date";

export default async function Home() {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  }) as Ymd;

  const [outputs, learnSessions, contributions, tasks] = await Promise.all([
    loadOutputs(today),
    loadLearnSessions(today),
    loadContributions(),
    loadTasks(),
  ]);

  return (
    <main className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">データ取得確認</h1>

      <section>
        <h2 className="mb-3 text-xl font-bold">ブログ記事（microCMS）</h2>
        <Result result={outputs} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">学習時間（Notion）</h2>
        <Result result={learnSessions} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">GitHub Contribution</h2>
        <Result result={contributions} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">タスク（Notion）</h2>
        <Result result={tasks} />
      </section>
    </main>
  );
}

function Result<T>({
  result,
}: {
  result: { ok: true; data: T } | { ok: false; message: string };
}) {
  if (!result.ok) {
    return (
      <div className="rounded bg-red-50 p-4 text-red-700">
        <p className="font-bold">取得失敗</p>
        <p>{result.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="font-bold text-green-600">取得成功</p>
      <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm text-black">
        {JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}
