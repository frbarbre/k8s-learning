export const dynamic = "force-dynamic";

async function getData() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/hello`);
    if (!res.ok) {
      console.log(res);
      return null;
    }

    const result = res.json();
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="flex flex-col min-h-svh items-center justify-center">
      <p>Server</p>
      <h2>{process.env.MESSAGE}</h2>

      <p>Client</p>
      <h2>{process.env.NEXT_PUBLIC_MESSAGE}</h2>

      <p>Data from backend</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
