/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({ extraStyle }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleClick = () => {
    if (status === "authenticated") {
      router.push(config.auth.callbackUrl);
    } else {
      signIn("google", { callbackUrl: config.auth.callbackUrl });
    }
  };

  if (status === "authenticated") {
    return (
      <Link href={config.auth.callbackUrl} className="inline-flex">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98, y: 0 }}
          className={`relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 ${extraStyle ? extraStyle : ""}`}
        >
          {session.user?.image ? (
            <img
              src={session.user?.image}
              alt={session.user?.name || "Account"}
              className="w-6 h-6 rounded-full shrink-0"
              referrerPolicy="no-referrer"
              width={24}
              height={24}
            />
          ) : (
            <span className="w-6 h-6 bg-white/10 flex justify-center items-center rounded-full shrink-0 text-xs font-bold">
              {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "G"}
            </span>
          )}
          <span>{session.user?.name || session.user?.email || "My account"}</span>
        </motion.button>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      onClick={handleClick}
      className={`relative inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 ${extraStyle ? extraStyle : ""}`}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#4285F4] font-black text-base shadow-sm">
        G
      </span>
      <span className="leading-tight text-left">
        <span className="block text-xs text-white/60">Continue with</span>
        <span className="block">Google</span>
      </span>
    </motion.button>
  );
};

export default ButtonSignin;
