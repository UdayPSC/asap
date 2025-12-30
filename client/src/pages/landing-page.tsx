import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaBolt, FaHandHoldingWater, FaMobileAlt, FaStar } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="bg-white overflow-hidden shadow-xl rounded-lg">
            <div className="p-6 sm:p-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h1 className="text-3xl sm:text-4xl font-bold">Fresh Water Jar Delivery - When You Need It</h1>
              <p className="mt-3 text-lg sm:text-xl max-w-3xl">
                Get pure water delivered to your doorstep in minutes. ASAP Water Jar Delivery provides the fastest and most reliable water delivery service in your area.
              </p>
              <div className="mt-8">
                <Button variant="secondary" asChild>
                  <Link href="/auth">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">Why Choose ASAP Water Jar Delivery?</h2>
            <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FaBolt className="text-xl" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Lightning Fast Delivery</h3>
                <p className="mt-2">Get your water jars delivered within 30 minutes of placing your order, guaranteed.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FaHandHoldingWater className="text-xl" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Pure & Safe Water</h3>
                <p className="mt-2">All our water jars go through rigorous quality checks to ensure purity and safety.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FaMobileAlt className="text-xl" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Convenient Ordering</h3>
                <p className="mt-2">Place orders easily through our web application with just a few clicks.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">What Our Customers Say</h2>
            <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2">
              {/* Testimonial 1 */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-slate-900">Rajesh Kumar</h4>
                    <div className="flex text-yellow-400">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-slate-700">"Incredible service! I ordered water at 2 PM and received it by 2:25 PM. The app is super easy to use and the delivery person was very professional."</p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-slate-900">Priya Sharma</h4>
                    <div className="flex text-yellow-400">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar className="text-yellow-200" />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-slate-700">"ASAP Water Jar Delivery has been a lifesaver for my office. We never run out of water anymore, and the ease of scheduling recurring deliveries is fantastic!"</p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="mt-12 bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900">We Value Your Feedback</h2>
            <p className="mt-2 text-slate-700">Help us improve our service by sharing your experience with ASAP Water Jar Delivery.</p>
            
            <div className="mt-6">
              <FeedbackForm />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
