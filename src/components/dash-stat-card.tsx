import { Card, CardContent } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { DynamicIcon } from "./DynamicIcon";

export function DashboardStatsCard({ stat, title }: {
  stat: {
    value: string;
    subtitle: string;
    icon: {
      type: string;
      name: string;
      props: Record<string, string | number>;
    };
  } | undefined,
  title: string
}) {

  if (!stat) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-4 sm:p-6">
          <Spinner className="size-8 sm:size-10" />
        </CardContent>
      </Card >
    );
  }


  return (
    <Card
      className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75% text-white shadow-lg py-0"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-white/80 truncate">{title}</p>
            <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/80 truncate">
              {stat.subtitle}
            </p>
          </div>
          <div className="flex-shrink-0">
            <DynamicIcon
              icon={{
                ...stat.icon,
                props: {
                  ...stat.icon.props,
                  className: "h-6 w-6 sm:h-8 sm:w-8",
                },
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}