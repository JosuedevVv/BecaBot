import AIResponse from "../AIResponse"
import { SourceBadge } from "../SourceBadge"
import type { Message } from "@/stores/chatStore"

export const ChatMessageItem = ({
  message,
  isStreaming = false,
}: {
  message: Message
  isStreaming?: boolean
}) => {

  if (message.role === "user") {
    return (
      <div className="rise-in flex flex-col items-end gap-1.5">
        <span className=" rounded border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
          Tu consulta
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-br-[4px] border-2 border-black bg-black px-4 py-3 text-[14.5px] font-bold leading-relaxed text-white shadow-[4px_4px_0px_#d4d4d4]">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.content === "") return null

  return (
    <article className="rise-in relative min-w-0 max-w-full overflow-hidden rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000]">
      <div className="flex min-w-0 flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-display text-[13.5px] font-black uppercase tracking-tight text-black">
              BecaBot Asesor
            </span>
            {isStreaming && (
              <span className="inline-flex items-center gap-1 rounded border border-black bg-neutral-100 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-black">
                <span className="size-1.5 animate-pulse rounded-full bg-black" />
                Redactando…
              </span>
            )}
          </div>
          {message.source && <SourceBadge source={message.source} />}
        </div>

        <div className="relative min-w-0 max-w-full">
          <AIResponse response={message.content} />
          {isStreaming && (
            <span
              aria-hidden
              className="ml-1 inline-block h-4 w-2 animate-pulse bg-black align-middle"
            />
          )}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border-2 border-black bg-neutral-50 p-3.5 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-black">
                Fuentes oficiales consultadas:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {message.citations.map((fuente) => (
                <div key={fuente.title} className="flex items-center">
                  {fuente.url ? (
                    <a
                      href={fuente.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 rounded-lg border-2 border-black bg-white px-2.5 py-1 text-[12px] font-black text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-black hover:text-white"
                    >
                      <span>{fuente.title}</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-lg border-2 border-black bg-white px-2.5 py-1 text-[12px] font-bold text-black">
                      {fuente.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {message.source === "web" && message.knowledge && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-neutral-100 px-3 py-1.5 text-[11.5px] font-black text-black">
            <span className="size-2 shrink-0 rounded-full bg-emerald-600" />
            <span>
              Conocimiento verificado aprendido y guardado en la Base RAG de México.
            </span>
          </div>
        )}

        <div className="border-t-2 border-neutral-200 pt-2 text-[10px] font-black uppercase tracking-wider text-neutral-600">
          Orientación informativa · Verifica siempre la convocatoria oficial
        </div>
      </div>
    </article>
  )
}
