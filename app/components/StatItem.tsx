"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlayerStat } from "../types";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { GripVertical, X, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface StatItemProps {
  stat: PlayerStat;
  weight: number;
  isLocked: boolean;
  onWeightChange: (value: number) => void;
  onLockToggle: () => void;
  onRemove: () => void;
}

export default function StatItem({
  stat,
  weight,
  isLocked,
  onWeightChange,
  onLockToggle,
  onRemove,
}: StatItemProps) {
  const [inputValue, setInputValue] = useState(
    String((weight * 100).toFixed(2))
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    setInputValue((weight * 100).toFixed(2));
  }, [weight]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onWeightChange(numValue / 100);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!isLocked) {
      const newValue = value[0];
      setInputValue(newValue.toFixed(2));
      onWeightChange(newValue / 100);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 flex flex-col gap-4 bg-card"
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-move touch-none">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">{stat.name}</h3>
          <p className="text-sm text-muted-foreground">{stat.category}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            value={[parseFloat(inputValue)]}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={0.01}
            disabled={isLocked}
            className={isLocked ? "opacity-50" : ""}
          />
        </div>

        <div className="w-24">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            min={0}
            max={100}
            step={0.01}
            className="w-full text-right"
            disabled={isLocked}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onLockToggle}
          className={`${isLocked ? "text-primary" : "text-muted-foreground"}`}
        >
          {isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive hidden md:inline-flex"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
