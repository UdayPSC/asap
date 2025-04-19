import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { ShopSettingsForm } from "@/components/forms/shop-settings-form";

export default function ShopSettings() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                Shop Settings
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button variant="outline" asChild>
                <Link href="/owner/dashboard">
                  <ChevronLeft className="-ml-1 mr-2 h-5 w-5" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Business Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Manage your shop's pricing and operation hours.
                </p>
              </div>
              <div className="border-t border-slate-200 px-4 py-5 sm:p-6">
                <ShopSettingsForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
