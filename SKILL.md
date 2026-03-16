---
name: gemini-cli
description: "Use Gemini CLI when processing images, PDFs, large files, needing 1M+ token context, or requiring Gemini's strong reasoning and fine-grained domain knowledge.
allowed-tools: Bash, Read
---

# Gemini CLI

**Note**:

- Gemini's knowledge cutoff means it may struggle with very recent events or factual details. For latest information, prefer web search.

- Always set max timeout limit because it can take quite long time for responses. If it still times out, use exponential backoff when waiting(`sleep`) for bash output.

- If gemini returns empty response, try explicitly ask it to continue in the same session.

## New Conversation (clears context and creates new session)

Use this tool only when to start a new conversation. Never use it if you want to continue conversation.

```bash
gemini "$(cat << 'EOF'
hello
EOF
)"
```

## Continue conversation (primary tool)

```bash
gemini -r latest -p "$(cat << 'EOF'
follow up
EOF
)"
```

## List sessions

Use it to check session uuid for continue from session.

```bash
gemini --list-sessions
```

## Continue from session

Use to continue conversation.

```bash
gemini -r {uuid} -p "$(cat << 'EOF'
follow up
EOF
)"
```

## File Reference

```bash
gemini "$(cat << 'EOF'
@file.ts explain this code
EOF
)"
```
