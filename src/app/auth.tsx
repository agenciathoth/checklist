"use client";

import { signIn, signOut } from "next-auth/react";

export const Login = () => <button onClick={() => signIn()}>Entrar</button>;

export const Logout = () => <button onClick={() => signOut()}>Satir</button>;
