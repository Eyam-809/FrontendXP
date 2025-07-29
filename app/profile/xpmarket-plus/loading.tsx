import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function XPmarketPlusLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-gray-100 border-gray-300" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center flex-1">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="w-24"></div>
        </div>

        {/* Plans Comparison Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Family Plan Skeleton */}
          <Card className="bg-white shadow-lg border-2 border-yellow-400 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Skeleton className="h-6 w-48 rounded-full" />
            </div>
            <CardHeader className="text-center pt-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-10 w-40 mx-auto mb-4" />
              
              {/* Gaming Apps Icons Skeleton */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton key={index} className="w-10 h-10 rounded-lg" />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              
              <div className="pt-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-4 w-48 mx-auto" />
                  <Skeleton className="h-4 w-56 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Plan Skeleton */}
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-10 w-40 mx-auto mb-4" />
              
              {/* Gaming Apps Icons Skeleton */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton key={index} className="w-10 h-10 rounded-lg" />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              
              <div className="pt-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <div className="text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Benefits Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-80 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 