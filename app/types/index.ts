export interface PlayerStat {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  image_url: string;
  stats: Record<string, number>;
}

export interface Formula {
  stats: PlayerStat[];
  weights: Record<string, number>;
}
