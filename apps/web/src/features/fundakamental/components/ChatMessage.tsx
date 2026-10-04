// Ported verbatim from features-incoming/fundakamental/src/components/ChatMessage.tsx.
// No import-path changes needed — only external deps (framer-motion, lucide-react).
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// The assistant answers in markdown (headings, tables, bold, lists); without
// rendering it the chat showed raw `##` and `| a | b |` text.
const markdownComponents = {
  h1: (p: any) => <h1 className="text-base font-bold mt-3 mb-1.5" {...p} />,
  h2: (p: any) => <h2 className="text-[15px] font-semibold mt-3 mb-1.5" {...p} />,
  h3: (p: any) => <h3 className="text-sm font-semibold mt-2.5 mb-1" {...p} />,
  p: (p: any) => <p className="my-1.5 leading-relaxed" {...p} />,
  ul: (p: any) => <ul className="my-1.5 pl-5 list-disc space-y-0.5" {...p} />,
  ol: (p: any) => <ol className="my-1.5 pl-5 list-decimal space-y-0.5" {...p} />,
  strong: (p: any) => <strong className="font-semibold" {...p} />,
  a: (p: any) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
  table: (p: any) => (
    <div className="my-2 overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs border-collapse" {...p} />
    </div>
  ),
  th: (p: any) => <th className="bg-muted/60 px-2 py-1.5 text-left font-semibold border-b border-border whitespace-nowrap" {...p} />,
  td: (p: any) => <td className="px-2 py-1.5 border-b border-border/60 align-top" {...p} />,
  code: (p: any) => <code className="px-1 py-0.5 rounded bg-muted text-xs" {...p} />,
  blockquote: (p: any) => <blockquote className="border-l-4 border-primary/40 pl-3 my-2 text-muted-foreground" {...p} />,
};

export interface ChatSource {
  document: string;
  page: number;
  excerpt: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isLoading?: boolean;
}

const ChatMessage = ({
  role,
  content,
  sources,
  isLoading = false,
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] space-y-2`}>
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-xl ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-secondary/80 text-foreground rounded-bl-none border border-border"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-200" />
              </div>
            </div>
          ) : (
            isUser ? (
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            ) : (
              <div className="text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>
            )
          )}
        </div>

        {/* Sources - Only for assistant messages */}
        {!isUser && sources && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 ml-2"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Sources:
            </p>
            {sources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-xs hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground/80 truncate">
                      {source.document}
                    </p>
                    <p className="text-muted-foreground/80">Page {source.page}</p>
                    <p className="text-muted-foreground/60 mt-1 line-clamp-2 italic">
                      "{source.excerpt}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
