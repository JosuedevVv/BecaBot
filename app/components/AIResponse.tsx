"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AIResponseProps = {
  response: string;
};

export default function AIResponse({ response }: AIResponseProps) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
        }}
      >
        {response}
      </ReactMarkdown>
    </div>
  );
}