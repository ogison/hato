"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type PigeonCardDefinition = {
  id: number;
  name: string;
  imagePath: string;
};

type Card = {
  id: number;
  pairId: number;
  imagePath: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const PIGEON_FALLBACK_IMAGE = "/pigeons/pigeon-fallback.svg";

const PIGEON_CARDS: PigeonCardDefinition[] = [
  { id: 0, name: "カワラバト", imagePath: "/pigeons/rock-dove.svg" },
  {
    id: 1,
    name: "シロレースホーミングピジョン",
    imagePath: "/pigeons/white-homing-pigeon.svg",
  },
  { id: 2, name: "カンムリバト", imagePath: "/pigeons/crowned-pigeon.svg" },
  { id: 3, name: "ニコバルバト", imagePath: "/pigeons/nicobar-pigeon.svg" },
  {
    id: 4,
    name: "オウギバト",
    imagePath: "/pigeons/victoria-crowned-pigeon.svg",
  },
  { id: 5, name: "ファンテイル", imagePath: "/pigeons/fantail-pigeon.svg" },
  { id: 6, name: "ジャコビン", imagePath: "/pigeons/jacobin-pigeon.svg" },
  { id: 7, name: "ラホール", imagePath: "/pigeons/lahore-pigeon.svg" },
  { id: 8, name: "キングピジョン", imagePath: "/pigeons/king-pigeon.svg" },
  {
    id: 9,
    name: "リョコウバト",
    imagePath: "/pigeons/passenger-pigeon.svg",
  },
];

const shuffleCards = (): Card[] => {
  const duplicated = PIGEON_CARDS.flatMap((pigeon) => [
    {
      pairId: pigeon.id,
      imagePath: pigeon.imagePath,
      name: pigeon.name,
    },
    {
      pairId: pigeon.id,
      imagePath: pigeon.imagePath,
      name: pigeon.name,
    },
  ]);

  return duplicated
    .map((card, index) => ({
      id: index,
      ...card,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({ ...card, id: index }));
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const matchedCount = useMemo(
    () => cards.filter((card) => card.isMatched).length / 2,
    [cards],
  );

  const handleCardClick = (id: number) => {
    if (openedCards.length === 2) {
      return;
    }

    const target = cards.find((card) => card.id === id);
    if (!target || target.isFlipped || target.isMatched) {
      return;
    }

    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)),
    );

    if (openedCards.length === 0) {
      setOpenedCards([id]);
      return;
    }

    const firstId = openedCards[0];
    const firstCard = cards.find((card) => card.id === firstId);
    if (!firstCard) {
      setOpenedCards([id]);
      return;
    }

    setOpenedCards([firstId, id]);
    setTurns((prev) => prev + 1);

    if (firstCard.pairId === target.pairId) {
      setCards((prev) => {
        const updated = prev.map((card) =>
          card.id === firstId || card.id === id
            ? { ...card, isMatched: true }
            : card,
        );

        if (updated.every((card) => card.isMatched)) {
          setIsCleared(true);
        }

        return updated;
      });
      setOpenedCards([]);
      return;
    }

    setTimeout(() => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === id
            ? { ...card, isFlipped: false }
            : card,
        ),
      );
      setOpenedCards([]);
    }, 700);
  };

  const handleRestart = () => {
    setCards(shuffleCards());
    setOpenedCards([]);
    setTurns(0);
    setIsCleared(false);
    setBrokenImages({});
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <h1 className="text-center text-3xl font-bold">鳩の神経衰弱</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow">
          <p className="text-lg font-medium">手数: {turns}</p>
          <p className="text-lg font-medium">
            揃ったペア: {matchedCount} / {PIGEON_CARDS.length}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            リスタート
          </button>
        </div>

        {isCleared ? (
          <p className="rounded-xl bg-emerald-100 p-4 text-center text-2xl font-bold text-emerald-700">
            クリア！おめでとうございます！
          </p>
        ) : null}

        <section className="grid grid-cols-4 gap-4 sm:grid-cols-5">
          {cards.map((card) => {
            const isOpen = card.isFlipped || card.isMatched;
            const imagePath = brokenImages[card.id]
              ? PIGEON_FALLBACK_IMAGE
              : card.imagePath;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched}
                className="aspect-square overflow-hidden rounded-xl border border-slate-300 shadow-sm transition hover:scale-[1.02] disabled:cursor-not-allowed"
              >
                {isOpen ? (
                  <span className="relative flex h-full items-center justify-center rounded-xl bg-white">
                    <Image
                      src={imagePath}
                      alt={card.name}
                      fill
                      sizes="(max-width: 640px) 25vw, 20vw"
                      className="object-cover"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [card.id]: true }))
                      }
                    />
                    <span className="pointer-events-none absolute inset-x-1 bottom-1 rounded-md bg-slate-900/65 px-1 py-0.5 text-center text-[10px] font-semibold text-white sm:text-xs">
                      {card.name}
                    </span>
                  </span>
                ) : (
                  <span className="flex h-full items-center justify-center rounded-xl bg-slate-800 text-xl font-semibold text-white">
                    鳩
                  </span>
                )}
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
