"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
}

export default function ToolHeader({
  title,
  subtitle,
  showBackButton = true,
}: ToolHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-primary">
                Lumiwaves Automation
              </h1>
              <p className="text-sm text-muted-foreground">
                {title}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        {subtitle && (
          <div className="text-sm text-muted-foreground">
            {subtitle}
          </div>
        )}
      </div>
    </header>
  )
}