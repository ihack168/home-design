"use client"

import Link from "next/link"
import {
  Home,
  ClipboardCheck,
  Users,
  FileText,
  HandCoins,
  ShieldCheck,
} from "lucide-react"

interface ServiceItem {
  title: string
  description: string
  icon: React.ReactNode
  link?: string
}

const services: ServiceItem[] = [
  {
    title: "房屋出租評估",
    description:
      "協助房東了解房屋是否適合加入社會住宅包租代管，評估出租條件、屋況與後續管理方式。",
    icon: <Home size={24} />,
  },
  {
    title: "包租代管申請協助",
    description:
      "說明社會住宅包租代管流程、所需資料與注意事項，降低房東自行研究政策的時間成本。",
    icon: <ClipboardCheck size={24} />,
  },
  {
    title: "租客媒合服務",
    description:
      "協助媒合合適租客，提升出租效率，減少空租時間，讓房屋更快進入穩定出租狀態。",
    icon: <Users size={24} />,
  },
  {
    title: "租約與租務管理",
    description:
      "協助處理租約說明、租金收付、租客溝通與日常租務協調，讓房東省時又安心。",
    icon: <FileText size={24} />,
  },
  {
    title: "租屋補助諮詢",
    description:
      "提供租屋補助與社會住宅相關政策資訊說明，協助房東與租客了解可適用的方案。",
    icon: <HandCoins size={24} />,
  },
  {
    title: "出租風險協助",
    description:
      "透過專業出租管理與後續協調服務，協助降低空租、溝通與租務處理上的不確定性。",
    icon: <ShieldCheck size={24} />,
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden px-6 py-24"
    >
      <div className="absolute left-0 top-20 h-[240px] w-[240px] rounded-full bg-primary/10 blur-[90px]" />
      <div className="absolute right-0 bottom-0 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-primary">
            RENTAL MANAGEMENT
          </p>

          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            社會住宅包租代管
            <span className="block text-primary">
              一站式出租服務
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground">
            從房屋出租評估、包租代管申請說明、
            租客媒合到後續租務管理，
            協助房東更有效率地出租房屋，
            讓租屋流程更簡單、更穩定。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const CardContent = (
              <div className="group relative h-full overflow-hidden rounded-[2rem] border border-border/70 bg-white/85 p-7 shadow-[0_10px_40px_rgba(31,78,121,0.08)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_60px_rgba(31,78,121,0.14)]">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {service.icon}
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                    了解更多
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            )

            if (service.link) {
              return (
                <Link
                  key={service.title}
                  href={service.link}
                  className="block"
                >
                  {CardContent}
                </Link>
              )
            }

            return (
              <div key={service.title}>
                {CardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}