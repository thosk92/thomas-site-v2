export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
};

export type ThoughtEntry = {
  id: string;
  date: string;
  rawText: string;
  reframedText: string;
};

export type ExerciseType = "breathing" | "journal" | "reframe";

export type ExerciseSession = {
  id: string;
  date: string;
  type: ExerciseType;
};
