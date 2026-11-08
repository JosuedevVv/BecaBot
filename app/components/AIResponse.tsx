"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AIResponseProps = {
  response: string;
};

export default function AIResponse({ response }: AIResponseProps) {
  return (
    <div className="markdown min-w-0 max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrapper">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {response}
      </ReactMarkdown>
    </div>
  );
}