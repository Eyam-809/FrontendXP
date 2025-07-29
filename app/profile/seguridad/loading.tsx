import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SeguridadLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-gray-100 border-gray-300" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center flex-1">
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="w-24"></div>
        </div>

        {/* Two Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card Skeleton */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Security Settings Card Skeleton */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-6 w-10 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-px w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Security Tips Skeleton */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="space-y-1">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 