"use client";
export function RemoveDarkMode() {
  return (
    <div ref={() => {
      if (typeof window !== "undefined") {
        document.documentElement.classList.remove("dark");
      }
    }}>
    </div>
  );
}