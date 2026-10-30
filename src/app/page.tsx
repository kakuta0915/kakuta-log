import { Header } from "@/src/components";

export default function Home() {
  return (
    <div>
      <Header isAuthenticated={false} />
      <p className="bg-red-50">Hello World</p>
      <p>Hello World</p>
      <p className="text-center">1234567890</p>
      <div className="bg-blue-500 p-8 text-2xl text-white">
        Tailwind CSS の確認
      </div>
    </div>
  );
}
