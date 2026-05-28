import os
from typing import List, Dict, Any, AsyncGenerator

import anthropic

from app.models.chat import ChatMessage

LEGAL_SYSTEM_PROMPT = """\
You are LexRwanda, a legal information assistant specializing in Rwandan law.

Your mission: help citizens of Rwanda understand their legal rights and obligations \
by explaining official legal documents clearly, accurately, and without jargon.

═══ GROUNDING RULES (never violate these) ═══
1. Answer ONLY based on the retrieved legal documents supplied in the context block.
2. Every factual claim must include an inline citation: [Document Name, Article X].
3. If the answer is not clearly supported by the retrieved documents, say exactly:
   "I could not find specific legal guidance on this in my current document \
collection. I recommend consulting a licensed attorney in Rwanda."
4. Never speculate about legal outcomes or give personalized legal advice.
5. If multiple documents conflict, note the conflict explicitly.

═══ STYLE ═══
• Use plain, clear language by default.
• Short paragraphs and bullet points for multi-part answers.
• Avoid Latin legal phrases unless you immediately define them.
• If the user asks for simpler language, use everyday words and analogies.

═══ CONFIDENCE ═══
After your answer, add one line:
Confidence: HIGH | MEDIUM | LOW
  HIGH   = answer is directly and explicitly stated in the retrieved text
  MEDIUM = answer requires reasonable inference from retrieved provisions
  LOW    = retrieved text only partially addresses the question

═══ MANDATORY DISCLAIMER ═══
End every response with:
⚖️ This is legal information, not legal advice. Laws may be amended. \
For advice specific to your situation, consult a licensed attorney in Rwanda.\
"""

SIMPLE_MODE_ADDENDUM = """

═══ SIMPLIFICATION MODE ACTIVE ═══
The user requested a plain-language explanation.
• Use everyday words — no legal jargon whatsoever.
• Short sentences (max 20 words each).
• Use analogies from daily life where helpful.
• Imagine explaining to a neighbour who has never read a law before.\
"""


class LegalGenerator:
    """Claude-powered answer generator. Uses prompt caching on the system prompt."""

    def __init__(self, model: str = "claude-sonnet-4-6", api_key: str = None):
        self.model = model
        self._client = anthropic.Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))

    # ----------------------------------------------------------- context builder

    def build_context(self, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return "⚠ No relevant legal documents were retrieved for this query."

        parts = ["══════════ RETRIEVED LEGAL DOCUMENTS ══════════\n"]
        for i, chunk in enumerate(chunks, 1):
            meta = chunk["metadata"]
            parts.append(
                f"[Source {i}]\n"
                f"Document : {meta.get('document_name', 'Unknown')}\n"
                f"Section  : {meta.get('section_header', 'Unknown')}\n"
                f"Relevance: {round(chunk['similarity'] * 100, 1)}%\n\n"
                f"{chunk['text']}\n"
                f"{'─' * 60}"
            )
        return "\n".join(parts)

    def determine_confidence(self, chunks: List[Dict]) -> str:
        if not chunks:
            return "low"
        top = max(c["similarity"] for c in chunks)
        if top >= 0.85:
            return "high"
        if top >= 0.70:
            return "medium"
        return "low"

    # -------------------------------------------------------------- generation

    def _build_messages(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        history: List[ChatMessage],
        explain_simply: bool,
    ) -> List[Dict]:
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in history[-6:]  # keep last 3 turns
        ]
        context = self.build_context(chunks)
        user_content = f"{context}\n\n══════════ USER QUESTION ══════════\n{query}"
        messages.append({"role": "user", "content": user_content})
        return messages

    def _system(self, explain_simply: bool) -> List[Dict]:
        text = LEGAL_SYSTEM_PROMPT
        if explain_simply:
            text += SIMPLE_MODE_ADDENDUM
        return [{"type": "text", "text": text, "cache_control": {"type": "ephemeral"}}]

    def generate(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        history: List[ChatMessage],
        explain_simply: bool = False,
    ) -> str:
        response = self._client.messages.create(
            model=self.model,
            max_tokens=1800,
            system=self._system(explain_simply),
            messages=self._build_messages(query, chunks, history, explain_simply),
        )
        return response.content[0].text

    async def generate_stream(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        history: List[ChatMessage],
        explain_simply: bool = False,
    ) -> AsyncGenerator[str, None]:
        with self._client.messages.stream(
            model=self.model,
            max_tokens=1800,
            system=self._system(explain_simply),
            messages=self._build_messages(query, chunks, history, explain_simply),
        ) as stream:
            for token in stream.text_stream:
                yield token
