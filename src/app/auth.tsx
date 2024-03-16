"use client";

import { signOut } from "next-auth/react";

export const Logout = () => <button onClick={() => signOut()}>Sair</button>;
