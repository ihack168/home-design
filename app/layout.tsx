import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans_TC } from "next/font/google"
import Script from "next/script"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

import "./globals.css"

const siteUrl = "https://home-design.line88.tw"
const siteName = "台灣室內設計資訊網"
const shortSiteName = "台灣室內設計資訊網"

const defaultTitle =
  "台灣室內設計資訊網｜建案設計提案、居家裝潢與空間規劃"

const siteDescription =
  "台灣室內設計資訊網整理全台住宅建案、室內設計風格、居家裝潢、格局坪數、空間規劃與收納設計相關資訊，提供屋主尋找住宅設計方向與裝潢靈感。"

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: siteName,

  verification: {
    google: "nU4axksZUmOI-MZr0WLspqPAY4elIf9NNx_zg89tfsM",
  },

  title: {
    default: defaultTitle,
    template: `%s｜${shortSiteName}`,
  },

  description: siteDescription,

  keywords: [
    "室內設計",
    "室內裝潢",
    "居家裝潢",
    "住宅設計",
    "建案室內設計",
    "建案設計提案",
    "新成屋裝潢",
    "預售屋客變",
    "老屋翻新",
    "小坪數設計",
    "格局規劃",
    "空間設計",
    "收納設計",
    "客廳設計",
    "臥室設計",
    "廚房設計",
    "現代風室內設計",
    "北歐風室內設計",
  ],

  creator: siteName,
  publisher: siteName,

  category: "室內設計與居家裝潢",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      {
        url: "/images/logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: defaultTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "/images/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "台灣室內設計資訊網－住宅建案設計與居家裝潢提案",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
    images: ["/images/og-home.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: shortSiteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: `${siteUrl}/images/logo.png`,
      contentUrl: `${siteUrl}/images/logo.png`,
      caption: siteName,
    },
    image: {
      "@id": `${siteUrl}/#logo`,
    },
    description: siteDescription,
    areaServed: {
      "@type": "Country",
      name: "Taiwan",
    },
    knowsAbout: [
      "室內設計",
      "住宅室內設計",
      "室內裝潢",
      "建案設計提案",
      "新成屋裝潢",
      "預售屋客變",
      "老屋翻新",
      "小坪數設計",
      "住宅格局規劃",
      "居家空間設計",
      "室內設計風格",
      "居家收納設計",
      "裝潢預算規劃",
    ],
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: siteName,
    alternateName: shortSiteName,
    description: siteDescription,
    inLanguage: "zh-Hant-TW",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
  }

  return (
    <html
      lang="zh-Hant-TW"
      className={`${notoSansTC.variable} ${geistMono.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <Navbar />

        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

        <Script
          id="umami-analytics"
          src="https://ana.line88.tw/script.js"
          data-website-id="d9c20b02-c07c-4fe4-99ac-c8440daa70b1"
          strategy="afterInteractive"
        />

        <main className="min-h-screen pt-20">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}