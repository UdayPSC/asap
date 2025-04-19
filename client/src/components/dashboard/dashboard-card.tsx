import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function DashboardCard({
  icon,
  title,
  subtitle,
  linkText,
  linkHref,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600"
}: DashboardCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-slate-900">{subtitle}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-blue-600 hover:text-blue-500">
            {linkText} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
