"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// 定義文章類型，增加程式碼可讀性
interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  videoId?: string;
  tags: string[];
  link: string;
}

export default function BlogPage() {
  const [data, setData] = useState<{ posts: Post[]; pagination: { totalPages: number } } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        // 這裡會去呼叫你的 API Route
        const res = await fetch(`/api/blog?page=${page}&t=${new Date().getTime()}`);
        if (!res.ok) throw new Error("網路請求失敗");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("抓取文章失敗:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
    // 只有在瀏覽器環境下執行 scrollTo
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const cleanContent = (content: string) => {
    if (!content) return "無內容摘要";
    return content
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 80);
  };

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-black mb-12 italic text-[#ff8800]">
          最新文章
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ff8800]"></div>
          </div>
        ) : (
          <>
            {data?.posts && data.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.posts.map((post) => (
                  <article key={post.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-[#ff8800]/30 transition-all shadow-2xl">
                    <div className="relative h-52 w-full bg-black overflow-hidden">
                      {activeVideo === post.id && post.videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${post.videoId}?autoplay=1`}
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="relative h-full w-full cursor-pointer" onClick={() => post.videoId && setActiveVideo(post.id)}>
                          <img 
                            src={post.thumbnail} 
                            alt={post.title} 
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                          />
                          {post.videoId && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-11 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                <div className="border-l-[18px] border-l-white border-y-[11px] border-y-transparent ml-1"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(post.tags || []).map((tag) => (
                          <a 
                            key={tag} 
                            href={`https://blog.line88.tw/search/label/${encodeURIComponent(tag)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[14px] font-bold bg-[#ff8800]/10 text-[#ff8800] px-2 py-1 rounded hover:bg-[#ff8800] hover:text-black transition-all"
                          >
                            #{tag}
                          </a>
                        ))}
                      </div>

                      <h2 className="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-[#ff8800] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                        {cleanContent(post.content)}...
                      </p>
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#ff8800] text-xl font-bold group/link">
                          閱讀全文內容 <span className="group-hover/link:translate-x-2 transition-transform">→</span>
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 text-xl font-bold">
                暫時沒有相關文章。
              </div>
            )}

            {/* 分頁控制 */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-wrap justify-center items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="mr-2 text-xs font-bold tracking-widest border border-white/20 px-4 py-2 rounded-lg hover:bg-white/5 disabled:opacity-10 transition-all text-white"
                >
                  PREV
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-10 h-10 rounded-lg font-mono font-bold transition-all duration-300 border ${
                      page === num 
                        ? "bg-[#ff8800] text-black border-[#ff8800] shadow-[0_0_20px_rgba(255,136,0,0.6)] scale-110" 
                        : "bg-transparent text-gray-400 border-white/10 hover:border-[#ff8800]/50 hover:text-[#ff8800]"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page >= totalPages} 
                  className="ml-2 text-xs font-bold tracking-widest border border-white/20 px-4 py-2 rounded-lg hover:bg-white/5 disabled:opacity-10 transition-all text-white"
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}