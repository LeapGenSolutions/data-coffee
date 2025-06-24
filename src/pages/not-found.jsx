import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { DataCoffeeLogo } from "../components/data-coffee-logo";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <DataCoffeeLogo size="lg" />
        <div>
          <h1 className="text-6xl font-bold text-[#6f4536] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[#8B5A40] mb-2">
            This brew isn't ready yet
          </h2>
          <p className="text-[#9d6e54] mb-6">
            The page you're looking for seems to have been filtered out of our data.
          </p>
        </div>
        <Link href="/">
          <Button className="bg-[#8B5A40] hover:bg-[#6f4536] text-white">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}