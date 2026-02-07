"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Card = {
  id: string;
  pairId: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const PIGEON_IMAGES = [
  "/pigeons/pigeon-1.svg",
  "/pigeons/pigeon-2.svg",
  "/pigeons/pigeon-3.svg",
  "/pigeons/pigeon-4.svg",
  "/pigeons/pigeon-5.svg",
  "/pigeons/pigeon-6.svg",
  "/pigeons/pigeon-7.svg",
  "/pigeons/pigeon-8.svg",
] as const;

const FLIP_BACK_DELAY = 900;

const shuffleCards = (images: readonly string[]): Card[] =>
  images
    .flatMap((image, index) => {
      const pairId = `pair-${index}`;
      return [0, 1].map((copyIndex) => ({
        id: `${pairId}-${copyIndex}-${crypto.randomUUID()}`,
        pairId,
        image,
        isFlipped: false,
        isMatched: false,
      }));
    })
    .sort(() => Math.random() - 0.5);

export default function Home() {
  const totalPairs = PIGEON_IMAGES.length;

  const [cards, setCards] = useState<Card[]>(() => shuffleCards(PIGEON_IMAGES));
  const [firstSelectedId, setFirstSelectedId] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  const matchedPairs = useMemo(
    () => new Set(cards.filter((card) => card.isMatched).map((card) => card.pairId)).size,
    [cards],
  );
  const isCleared = matchedPairs === totalPairs;

  const handleCardClick = (id: string) => {
    if (isResolving) {
      return;
    }

    const target = cards.find((card) => card.id === id);
    if (!target || target.isFlipped || target.isMatched) {
      return;
    }

    setCards((previous) =>
      previous.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)),
    );

    if (!firstSelectedId) {
      setFirstSelectedId(id);
      return;
    }

    const first = cards.find((card) => card.id === firstSelectedId);
    if (!first) {
      setFirstSelectedId(id);
      return;
    }

    setTurns((previous) => previous + 1);

    if (first.pairId === target.pairId) {
      setCards((previous) =>
        previous.map((card) =>
          card.id === firstSelectedId || card.id === id
            ? { ...card, isMatched: true }
            : card,
        ),
      );
      setFirstSelectedId(null);
      return;
    }

    setIsResolving(true);
    window.setTimeout(() => {
      setCards((previous) =>
        previous.map((card) =>
          card.id === firstSelectedId || card.id === id
            ? { ...card, isFlipped: false }
            : card,
        ),
      );
      setFirstSelectedId(null);
      setIsResolving(false);
    }, FLIP_BACK_DELAY);
  };

  const restart = () => {
    setCards(shuffleCards(PIGEON_IMAGES));
    setFirstSelectedId(null);
    setTurns(0);
    setIsResolving(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">鳩神経衰弱</h1>
          <p className="mt-2 text-sm text-slate-600">
            2枚ずつめくって同じ鳩を揃えましょう。判定中は入力がロックされます。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              ターン数: {turns}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              成功ペア: {matchedPairs} / {totalPairs}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              {isCleared ? "クリア！🎉" : "プレイ中"}
            </span>
            <button
              type="button"
              onClick={restart}
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              リスタート
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => {
            const isFaceUp = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={isResolving || card.isMatched}
                className={`group relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                  isFaceUp
                    ? "border-emerald-500 bg-white shadow"
                    : "border-slate-300 bg-slate-200 hover:border-slate-400"
                } ${card.isMatched ? "ring-2 ring-emerald-300" : ""}`}
              >
                {isFaceUp ? (
                  <Image
                    src={card.image}
                    alt="鳩カード"
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-300 text-4xl">
                    🕊️
                  </div>
                )}
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
