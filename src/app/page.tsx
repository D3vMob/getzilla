
import Image from "next/image";

import logo from "../assets/logo_lg_gray.png";

import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex flex-col items-center justify-center gap-4">
          <Image 
            src={logo}
            alt="Getzilla Logo"
            width={300}
            height={300}
            priority
          />
          <h1 className="text-4xl font-bold text-center text-gray-400">
            Welcome to Getzilla
          </h1>
        </div>
      </main>
    </HydrateClient>
  );
}
