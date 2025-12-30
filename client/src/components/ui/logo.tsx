import { FaWater } from "react-icons/fa";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { user } = useAuth();
  
  let redirectUrl = "/";
  if (user) {
    redirectUrl = user.role === "customer" ? "/customer/dashboard" : "/owner/dashboard";
  }

  return (
    <Link href={redirectUrl} className={`flex items-center ${className || ""}`}>
      <FaWater className="mr-2 text-primary h-5 w-5" />
      <span className="text-primary font-bold text-xl">ASAP Water Jar Delivery</span>
    </Link>
  );
}
