"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Receipt, Sun, Home, Film, Droplets, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-blue-50">

      {/* Animated Background Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-yellow-300 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

      <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Lumiwaves Automation
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Solar Installations • Smart Home Automation • Home Theater Setup •
            Water Level Controllers
          </p>
        </div>

        {/* SERVICES PREVIEW */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

          <ServiceCard
            icon={<Sun className="w-8 h-8" />}
            title="Solar Systems"
            description="Efficient rooftop & on-grid installations"
          />

          <ServiceCard
            icon={<Home className="w-8 h-8" />}
            title="Smart Homes"
            description="Control lighting & appliances remotely"
          />

          <ServiceCard
            icon={<Film className="w-8 h-8" />}
            title="Home Theater"
            description="Cinematic experience at home"
          />

          <ServiceCard
            icon={<Droplets className="w-8 h-8" />}
            title="Water Controllers"
            description="Automated tank monitoring system"
          />
        </div>

        {/* TOOLS SECTION */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-primary">
            Business Tools
          </h2>
          <p className="text-muted-foreground">
            Manage your quotations and invoices efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          <Link href="/invoice">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/70 backdrop-blur">
              <CardContent className="p-8 flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Receipt className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    Invoice Generator
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Create professional billing invoices
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estimation">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/70 backdrop-blur">
              <CardContent className="p-8 flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    Estimation / Quotation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generate structured project quotations
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>

      </div>
    </div>
  )
}

/* Reusable Service Card */
function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group bg-white/70 backdrop-blur p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
      <div className="flex justify-center mb-4 text-primary group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}