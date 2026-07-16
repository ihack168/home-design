import Link from "next/link"
import {
  Building2,
  Palette,
  Ruler,
  Sofa,
  LayoutTemplate,
  MessageCircleMore,
} from "lucide-react"

interface ServiceItem {
  title: string
  description: string
  icon: React.ReactNode
  link?: string
}

const services: ServiceItem[] = [
  {
    title: "建案室內設計提案",
    description:
      "依照社區與建案名稱整理住宅室內設計方向，提供不同格局、坪數與生活需求的空間規劃靈感。",
    icon: <Building2 size={24} aria-hidden="true" />,
  },
  {
    title: "多元設計風格",
    description:
      "收錄現代風、北歐風、無印風、日式風、工業風與美式風等住宅設計與裝潢提案。",
    icon: <Palette size={24} aria-hidden="true" />,
  },
  {
    title: "坪數與格局規劃",
    description:
      "依照小坪數住宅、兩房、三房、四房與不同格局條件，提供動線、收納及空間配置建議。",
    icon: <Ruler size={24} aria-hidden="true" />,
  },
  {
    title: "居家空間設計",
    description:
      "從客廳、臥室、餐廳、廚房到玄關與書房，查看各個居家空間的設計與裝潢方向。",
    icon: <Sofa size={24} aria-hidden="true" />,
  },
  {
    title: "全室裝潢規劃",
    description:
      "整合風格、格局、色彩、材質與收納需求，建立適合屋主生活習慣的全室設計提案。",
    icon: <LayoutTemplate size={24} aria-hidden="true" />,
  },
  {
    title: "室內設計需求諮詢",
    description:
      "提供建案、坪數、格局與預算需求初步諮詢，協助屋主釐清裝潢方向與後續規劃重點。",
    icon: <MessageCircleMore size={24} aria-hidden="true" />,
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-hidden px-6 py-24"
    >
      {/* 背景裝飾 */}
      <div className="pointer-events-none absolute left-0 top-20 h-[240px] w-[240px] rounded-full bg-primary/10 blur-[90px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* 區塊標題 */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-accent">
            INTERIOR DESIGN PROPOSALS
          </p>

          <h2
            id="services-heading"
            className="text-3xl font-black tracking-tight text-foreground md:text-5xl"
          >
            從建案、坪數到設計風格
            <span className="block text-primary">
              找到適合你家的裝潢方向
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-muted-foreground">
            依照建案名稱、住宅坪數、房屋格局、居家空間與設計風格，
            整理不同類型的室內設計及裝潢提案，
            幫助屋主更快確認喜歡的空間方向。
          </p>
        </div>

        {/* 服務卡片 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const CardContent = (
              <div className="group relative h-full overflow-hidden rounded-[2rem] border border-border/70 bg-white/85 p-7 shadow-[0_10px_40px_rgba(53,51,46,0.08)] backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(53,51,46,0.14)]">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-accent/15 group-hover:text-accent">
                    {service.icon}
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {service.description}
                  </p>

                  {service.link && (
                    <div className="mt-6 flex items-center text-sm font-semibold text-primary">
                      查看設計提案

                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )

            if (service.link) {
              return (
                <Link
                  key={service.title}
                  href={service.link}
                  className="block h-full rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                >
                  {CardContent}
                </Link>
              )
            }

            return (
              <div key={service.title} className="h-full">
                {CardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}