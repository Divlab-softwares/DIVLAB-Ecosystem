import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connectez vous à votre compte DIVLAB ",
  description: "Page de connexion à votre compte DIVLAB Train. Connectez-vous pour accéder à votre espace personnel et suivre vos formations en ligne.",
};

export default function SignIn() {
  return <SignInForm />;
}
