export default function Home() {
  return (
    <div>
      <p className="bg-red-50">Hello World</p>
      <p>Hello World</p>
      <p className="text-center">1234567890</p>
      <div className="bg-blue-500 p-8 text-2xl text-white">
        Tailwind CSS の確認
      </div>
    </div>
  );
}

// グローバルCSSで定義しているフォントスタイルをいちいち要素に指定するのは冗長なので、コンポーネントではなく、ページで指定することで、コンポーネント内ではフォントスタイルを指定する必要がなくなる。のでは？
