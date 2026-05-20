"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function VolumeChart({
  data,
}: {
  data: Array<{ label: string; value: number; highlight?: boolean }>;
}) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12} />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgb(var(--border))",
              background: "rgb(var(--surface))",
              color: "rgb(var(--text-primary))",
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive={false}>
            {data.map((d, idx) => (
              <Cell
                key={idx}
                fill={`rgb(var(--secondary))`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
