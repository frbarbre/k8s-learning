
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="flex flex-col min-h-svh items-center justify-center">
     <p>Server</p>
     <h2>{process.env.MESSAGE}</h2>

     <p>Client</p>
     <h2>{process.env.NEXT_PUBLIC_MESSAGE}</h2>
    </div>
  );
}
