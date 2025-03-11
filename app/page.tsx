"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import FormulaBuilder from "./components/FormulaBuilder";
import ResultCard from "./components/ResultCard";
import { Player, PlayerStat } from "./types";
import {
  ShoppingBasket as Basketball,
  Share2,
  FolderRoot as Football,
  Baseline as Baseball,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeToggle } from "@/components/theme-toggle";

const AVAILABLE_STATS: PlayerStat[] = [
  {
    id: "ppg",
    name: "Points Per Game",
    category: "Scoring",
    description: "Average points scored per game",
  },
  {
    id: "rpg",
    name: "Rebounds Per Game",
    category: "Rebounds",
    description: "Average rebounds per game",
  },
  {
    id: "apg",
    name: "Assists Per Game",
    category: "Playmaking",
    description: "Average assists per game",
  },
  {
    id: "spg",
    name: "Steals Per Game",
    category: "Defense",
    description: "Average steals per game",
  },
  {
    id: "bpg",
    name: "Blocks Per Game",
    category: "Defense",
    description: "Average blocks per game",
  },
  {
    id: "mvp",
    name: "MVP Awards",
    category: "Awards",
    description: "Number of MVP awards won",
  },
  {
    id: "championships",
    name: "Championships",
    category: "Team Success",
    description: "Number of championships won",
  },
  {
    id: "allstar",
    name: "All-Star Selections",
    category: "Recognition",
    description: "Number of All-Star game selections",
  },
];

const EXAMPLE_PLAYERS: Player[] = [
  {
    id: "1",
    name: "Michael Jordan",
    image_url:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stats: {
      ppg: 30.1,
      rpg: 6.2,
      apg: 5.3,
      spg: 2.3,
      bpg: 0.8,
      mvp: 5,
      championships: 6,
      allstar: 14,
    },
  },
  {
    id: "2",
    name: "LeBron James",
    image_url:
      "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stats: {
      ppg: 27.1,
      rpg: 7.5,
      apg: 7.3,
      spg: 1.6,
      bpg: 0.8,
      mvp: 4,
      championships: 4,
      allstar: 19,
    },
  },
  {
    id: "3",
    name: "Kareem Abdul-Jabbar",
    image_url:
      "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    stats: {
      ppg: 24.6,
      rpg: 11.2,
      apg: 3.6,
      spg: 0.9,
      bpg: 2.6,
      mvp: 6,
      championships: 6,
      allstar: 19,
    },
  },
];

export default function Home() {
  const [results, setResults] = useState<{
    players: { player: Player; score: number }[];
    formula: {
      stats: PlayerStat[];
      weights: Record<string, number>;
    } | null;
  } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const calculateGoat = useCallback(
    async (selectedStats: PlayerStat[], weights: Record<string, number>) => {
      const playerScores = EXAMPLE_PLAYERS.map((player) => ({
        player,
        score: Object.entries(weights).reduce((total, [statId, weight]) => {
          const value = player.stats[statId as keyof typeof player.stats];
          return total + value * weight;
        }, 0),
      }));

      playerScores.sort((a, b) => b.score - a.score);

      setResults({
        players: playerScores,
        formula: {
          stats: selectedStats,
          weights,
        },
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formulaParams = Array.from(params.entries());

    if (formulaParams.length > 0) {
      const selectedStats = formulaParams
        .map(([statId]) => {
          const stat = AVAILABLE_STATS.find((s) => s.id === statId);
          return stat!;
        })
        .filter(Boolean);

      const weights = Object.fromEntries(
        formulaParams.map(([statId, weight]) => [statId, parseFloat(weight)])
      );

      if (selectedStats.length > 0) {
        calculateGoat(selectedStats, weights);
      }
    }
  }, [calculateGoat]);

  const handleShare = async () => {
    if (!results) return;

    const formulaText = results.formula?.stats
      .map(
        (stat) =>
          `${stat.name}: ${(
            (results.formula?.weights[stat.id] ?? 0) * 100
          ).toFixed(2)}%`
      )
      .join(", ");

    const topThree = results.players
      .slice(0, 3)
      .map(
        (result, index) =>
          `${index + 1}. ${result.player.name} (${result.score.toFixed(2)})`
      )
      .join("\n");

    const shareText = `🏀 According to my GOAT formula:\n\n${topThree}\n\nFormula used:\n${formulaText}\n\nWho's yours? ${window.location.origin}`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShareLink = async () => {
    if (!results?.formula) return;

    const params = new URLSearchParams();
    Object.entries(results.formula.weights).forEach(([statId, weight]) => {
      params.append(statId, weight.toString());
    });

    const shareUrl = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy share link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Basketball className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Who is the GOAT?</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="p-6 bg-card rounded-lg border h-full">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  1
                </span>
                <p className="leading-7">
                  Choose stats from the available options that you think make a
                  player great
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  2
                </span>
                <p className="leading-7">
                  Adjust the importance of each stat using the sliders to create
                  your perfect formula
                </p>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  3
                </span>
                <p className="leading-7">
                  Click "Who is the GOAT?" to see how the all-time greats rank
                  according to your formula
                </p>
              </li>
            </ol>
          </div>

          <div className="p-6 bg-card rounded-lg border h-full">
            <h2 className="text-2xl font-bold mb-4">Choose Sport</h2>
            <ToggleGroup
              type="single"
              value="basketball"
              className="flex flex-col gap-2"
            >
              <ToggleGroupItem
                value="basketball"
                aria-label="Basketball"
                className="justify-start"
              >
                <Basketball className="h-4 w-4 mr-2" />
                NBA
              </ToggleGroupItem>
              <ToggleGroupItem
                value="football"
                aria-label="Football"
                disabled
                className="justify-start"
              >
                <Football className="h-4 w-4 mr-2" />
                NFL (Coming Soon)
              </ToggleGroupItem>
              <ToggleGroupItem
                value="baseball"
                aria-label="Baseball"
                disabled
                className="justify-start"
              >
                <Baseball className="h-4 w-4 mr-2" />
                MLB (Coming Soon)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <FormulaBuilder
          availableStats={AVAILABLE_STATS}
          onCalculate={calculateGoat}
        />

        {results && (
          <div ref={resultsRef} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.players.slice(0, 3).map((result, index) => (
                <div key={result.player.id} className="flex flex-col gap-4">
                  <ResultCard
                    player={result.player}
                    score={result.score}
                    rank={index + 1}
                  />
                  {index === 0 && (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Results
                      </Button>
                      <Button variant="outline" onClick={handleShareLink}>
                        <Link className="mr-2 h-4 w-4" />
                        Share Formula Link
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
