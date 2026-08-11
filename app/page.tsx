import type { Metadata } from "next";
import TrainingJournal from "./training-journal";

export const metadata: Metadata = {
  title: "오늘의 9회 | 야구 성장 기록",
  description: "훈련과 마음을 함께 기록하는 아마야구 선수의 데일리 루틴 앱",
};

export default function Home() {
  return <TrainingJournal />;
}
