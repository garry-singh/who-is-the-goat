"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlayerStat } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import StatItem from "./StatItem";

interface FormulaBuilderProps {
  availableStats: PlayerStat[];
  onCalculate: (formula: PlayerStat[], weights: Record<string, number>) => void;
}

export default function FormulaBuilder({
  availableStats,
  onCalculate,
}: FormulaBuilderProps) {
  const [selectedStats, setSelectedStats] = useState<PlayerStat[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [lockedStats, setLockedStats] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formulaParams = Array.from(params.entries());

    if (formulaParams.length > 0) {
      const urlStats = formulaParams
        .map(([statId]) => {
          const stat = availableStats.find((s) => s.id === statId);
          return stat!;
        })
        .filter(Boolean);

      const urlWeights = Object.fromEntries(
        formulaParams.map(([statId, weight]) => [statId, parseFloat(weight)])
      );

      setSelectedStats(urlStats);
      setWeights(urlWeights);
    }
  }, [availableStats]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedStats((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const distributeWeights = (
    stats: PlayerStat[],
    currentWeights: Record<string, number>,
    locked: Set<string>
  ) => {
    if (stats.length === 0) return {};

    // Calculate total weight of locked stats
    const lockedWeight = Array.from(locked).reduce(
      (sum, statId) => sum + (currentWeights[statId] || 0),
      0
    );

    // Calculate remaining weight to distribute
    const remainingWeight = 1 - lockedWeight;

    // Count unlocked stats
    const unlockedCount = stats.filter((stat) => !locked.has(stat.id)).length;

    if (unlockedCount === 0) return currentWeights;

    // Calculate weight per unlocked stat
    const weightPerUnlockedStat = remainingWeight / unlockedCount;

    // Create new weights object
    return Object.fromEntries(
      stats.map((stat) => [
        stat.id,
        locked.has(stat.id) ? currentWeights[stat.id] : weightPerUnlockedStat,
      ])
    );
  };

  const addStat = (stat: PlayerStat) => {
    if (!selectedStats.find((s) => s.id === stat.id)) {
      const newStats = [...selectedStats, stat];
      setSelectedStats(newStats);
      setWeights((prevWeights) =>
        distributeWeights(newStats, prevWeights, lockedStats)
      );
    }
  };

  const removeStat = (statId: string) => {
    const newStats = selectedStats.filter((s) => s.id !== statId);
    const newLocked = new Set(lockedStats);
    newLocked.delete(statId);
    setLockedStats(newLocked);
    setSelectedStats(newStats);
    setWeights((prevWeights) =>
      distributeWeights(newStats, prevWeights, newLocked)
    );
  };

  const updateWeight = (statId: string, value: number) => {
    const updatedWeights = { ...weights, [statId]: value };
    setWeights(updatedWeights);
  };

  const toggleLock = (statId: string) => {
    const newLocked = new Set(lockedStats);
    if (newLocked.has(statId)) {
      newLocked.delete(statId);
    } else {
      newLocked.add(statId);
    }
    setLockedStats(newLocked);
    setWeights((prevWeights) =>
      distributeWeights(selectedStats, prevWeights, newLocked)
    );
  };

  const handleCalculate = () => {
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const isValid = Math.abs(totalWeight - 1) < 0.0001; // Using small epsilon for floating point comparison

    if (!isValid) {
      const currentTotal = (totalWeight * 100).toFixed(2);
      toast.error(
        `Your weights total ${currentTotal}%. Please adjust them to total exactly 100%.`
      );
      return;
    }

    onCalculate(selectedStats, weights);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Available Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableStats.map((stat) => (
            <motion.div
              key={stat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => addStat(stat)}
            >
              <Card
                className={`p-4 hover:bg-accent ${
                  selectedStats.some((s) => s.id === stat.id)
                    ? "border-primary"
                    : ""
                }`}
              >
                <h3 className="font-semibold">{stat.name}</h3>
                <p className="text-sm text-muted-foreground">{stat.category}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Formula</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedStats}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {selectedStats.map((stat) => (
                <StatItem
                  key={stat.id}
                  stat={stat}
                  weight={weights[stat.id]}
                  isLocked={lockedStats.has(stat.id)}
                  onWeightChange={(value) => updateWeight(stat.id, value)}
                  onLockToggle={() => toggleLock(stat.id)}
                  onRemove={() => removeStat(stat.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {selectedStats.length > 0 && (
          <Button className="mt-6 w-full" size="lg" onClick={handleCalculate}>
            <Trophy className="mr-2 h-5 w-5" />
            Who is the GOAT?
          </Button>
        )}
      </Card>
    </div>
  );
}
