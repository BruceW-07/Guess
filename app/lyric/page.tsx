import { Suspense } from "react";
import { LyricPageClient } from "./page-client";

export default function LyricPage() {
  return (
    <Suspense fallback={null}>
      <LyricPageClient />
    </Suspense>
  );
}
