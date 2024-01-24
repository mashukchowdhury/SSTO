import Layout from "../components/layout";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="mb-5 text-4xl font-bold">Dashboard</h1>
        <span className="text-7xl">🏡</span>
      </div>
    </Layout>
  );
}
