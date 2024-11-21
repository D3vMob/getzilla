import Image from "next/image";

import logo from "../assets/logo_lg_gray.png";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-bl from-black via-purple-950 to-black text-white">
        <div className="flex flex-col items-center justify-center gap-4">
          <Image 
            src={logo}
            alt="Getzilla Logo"
            width={300}
            height={300}
            priority
            className="drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)]"
          />
          <h1 className="text-4xl font-bold text-center z-10">
            Welcome to GETziLLa
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
