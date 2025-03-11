"use client";

import { motion } from "framer-motion";
import { Player } from "../types";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import Image from "next/image";

interface ResultCardProps {
  player: Player;
  score: number;
  rank: number;
}

export default function ResultCard({ player, score, rank }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
    >
      <Card
        className={`p-6 flex flex-col items-center text-center ${
          rank === 1 ? "border-yellow-500 border-2" : ""
        }`}
      >
        {rank === 1 && <Crown className="h-12 w-12 text-yellow-500 mb-4" />}
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image
            src={player.image_url}
            alt={player.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            #{rank}
          </div>
          <h2 className="text-2xl font-bold">{player.name}</h2>
          <p className="text-xl text-muted-foreground">
            Score: {score.toFixed(2)}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
