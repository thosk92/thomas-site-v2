"use client";

import Card from "@/components/mindclean/Card";
import ExerciseList from "@/components/mindclean/ExerciseList";

export default function ExercisesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Exercises</h1>
      <Card>
        <ExerciseList />
      </Card>
    </div>
  );
}
