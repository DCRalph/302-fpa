import * as LucideIcons from "lucide-react";


type IconConfig = {
  type: string;
  name: string;
  props?: Record<string, string | number>;
} | {
  icon: {
    type: string;
    name: string;
    props?: Record<string, string | number>;
  }
}

export function DynamicIcon(config: IconConfig) {
  let type: string;
  let name: string;
  let props: Record<string, string | number> = {};

  // Handle both formats: separate props or nested icon object
  if ('icon' in config) {
    type = config.icon.type;
    name = config.icon.name;
    props = config.icon.props ?? {};
  } else {
    type = config.type;
    name = config.name;
    props = config.props ?? {};
  }

  let IconComponent;

  if (type === 'lucide') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    IconComponent = (LucideIcons as any)[name];
  }

  if (!IconComponent) {
    return <span>Icon not found</span>;
  }

  return <IconComponent {...props} />;
}

