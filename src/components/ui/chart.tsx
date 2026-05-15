"use client";

import * as React from "react";
import {
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must be used within a ChartContainer.");
  }

  return context;
}

function getConfigEntryColor(config: ChartConfig[string] | undefined) {
  if (!config) {
    return "var(--chart-1)";
  }

  return config.color ?? config.theme?.light ?? "var(--chart-1)";
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactElement;
  }
>(({ className, config, children, style, ...props }, ref) => {
  const chartId = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const colorVariables = React.useMemo(() => {
    return Object.entries(config).reduce<Record<string, string>>((accumulator, [key, value]) => {
      accumulator[`--color-${key}`] = getConfigEntryColor(value);
      return accumulator;
    }, {});
  }, [config]);

  React.useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextWidth = element.clientWidth;
      const nextHeight = element.clientHeight;

      setSize((current) => {
        if (current.width === nextWidth && current.height === nextHeight) {
          return current;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={(node) => {
          containerRef.current = node;

          if (typeof ref === "function") {
            ref(node);
            return;
          }

          if (ref) {
            ref.current = node;
          }
        }}
        data-chart={chartId}
        className={cn(
          "h-[260px] min-h-[240px] w-full min-w-0 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-legend-item-text]:text-foreground [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector:focus-visible]:outline-none [&_.recharts-tooltip-cursor]:stroke-border [&_.recharts-tooltip-cursor]:opacity-50",
          className,
        )}
        style={{
          ...colorVariables,
          ...style,
        }}
        {...props}
      >
        {size.width > 0 && size.height > 0
          ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
              width: size.width,
              height: size.height,
            })
          : null}
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: number | string;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  hideLabel?: boolean;
  valueFormatter?: (value: number | string) => string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-[180px] rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
      {!hideLabel ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="space-y-2">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "");
          const entry = config[key];
          const tone = item.color ?? getConfigEntryColor(entry);
          const value = item.value ?? 0;

          return (
            <div key={key} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tone }}
                />
                <span className="text-foreground">
                  {entry?.label ?? item.name ?? key}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {valueFormatter ? valueFormatter(value) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendContent({
  payload,
}: {
  payload?: Array<{
    dataKey?: string | number;
    color?: string;
    value?: string;
  }>;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? "");
        const entry = config[key];

        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color ?? getConfigEntryColor(entry) }}
            />
            <span>{entry?.label ?? item.value ?? key}</span>
          </div>
        );
      })}
    </div>
  );
}
