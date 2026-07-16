import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans_TC } from "next/font/google"
import Script from "next/script"

import { Navbar } from "@/components/navbar"

import "./globals.css"

const siteUrl = "https://home.line88.tw"
const siteName = "台灣社會住宅包租代管資訊站"
const shortSiteName = "社會住宅包租代管資訊站"

const siteDescription =
  "台灣社會住宅包租代管資訊站整理社會住宅、包租代管、公益出租人、租屋補助、房東出租管理與租客權益相關資訊。本站由凌群不動產建立並經營，屬民間資訊網站，非政府機關或政府官方網站。"

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
    default: "台灣社會住宅包租代管資訊站｜房東出租與租屋政策資訊",
    template: `%s｜${shortSiteName}`,
  },

  description: siteDescription,

  keywords: [
    "社會住宅包租代管",
    "包租代管",
    "社宅包租代管",
    "公益出租人",
    "租屋補助",
    "房東出租",
    "租屋代管",
    "出租管理",
    "房屋出租",
    "租客權益",
  ],

  creator: "台灣社會住宅包租代管資訊站",
  publisher: siteName,

  category: "社會住宅與租屋資訊",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
    title: "台灣社會住宅包租代管資訊站｜房東出租與租屋政策資訊",
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
        alt: "台灣社會住宅包租代管資訊站",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "台灣社會住宅包租代管資訊站｜房東出租與租屋政策資訊",
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
      "社會住宅",
      "社會住宅包租代管",
      "包租代管",
      "公益出租人",
      "租屋補助",
      "房東出租管理",
      "租客權益",
      "住宅租賃",
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "凌群不動產",
    },
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

        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

        <Script
          id="umami-analytics"
          src="https://cloud.umami.is/script.js"
          data-website-id="acdb4aae-f0f6-4348-abfd-b31ddb784de8"
          strategy="afterInteractive"
        />

        {children}
      </body>
    </html>
  )
}
