import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creez votre compte DIVLAB ",
  description: "Page d'inscription à votre compte DIVLAB. Créez votre compte pour accéder à votre espace personnel et suivre vos formations en ligne.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
