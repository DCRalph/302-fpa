import * as LucideIcons from "lucide-react";


type IconConfig = {
  type: string;
  name: string;
  props?: Record<string, string | number>;
};

export function DynamicIcon({ type, name, props = {} }: IconConfig) {
  let IconComponent;

  if (type === 'lucide') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    IconComponent = (LucideIcons as any)[name];
  }

  if (!IconComponent) {
    return <span>Icon not found</span>;
  }

  console.log(IconComponent);

  return <IconComponent {...props} />;
}

