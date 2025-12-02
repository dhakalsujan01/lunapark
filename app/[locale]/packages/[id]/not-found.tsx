import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Package Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          Sorry, the package you're looking for doesn't exist or is no longer available.
        </p>
        <Button asChild>
          <Link href="/attractions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attractions
          </Link>
        </Button>
      </div>
    </div>
  )
}
