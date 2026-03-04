import type { SVGProps } from "react";

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
}

export const Icon = ({
  name,
  ...props
}: IconProps & SVGProps<SVGSVGElement>) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent {...props} />;
};

const PlugsDisconnected = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Plugs Disconnected"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.354 8.646a.5.5 0 0 0-.708 0L7.5 9.793 6.207 8.5l1.147-1.146a.5.5 0 1 0-.708-.708L5.5 7.793 4.354 6.646a.5.5 0 1 0-.708.708l.397.396-1.457 1.457a2 2 0 0 0 0 2.829l.336.335-1.776 1.775A.502.502 0 0 0 1.5 15a.501.501 0 0 0 .354-.146l1.775-1.776.335.336a2 2 0 0 0 2.83 0l1.456-1.457.396.397a.5.5 0 1 0 .708-.708L8.207 10.5l1.147-1.146a.5.5 0 0 0 0-.708ZM6.086 12.71a1 1 0 0 1-1.414 0l-1.379-1.38a1 1 0 0 1 0-1.415L4.75 8.457l2.793 2.793-1.457 1.459Zm8.768-11.563a.5.5 0 0 0-.708 0l-1.775 1.776-.335-.336a2.003 2.003 0 0 0-2.83 0L7.75 4.043l-.396-.397a.5.5 0 1 0-.708.708l5 5a.5.5 0 1 0 .708-.708l-.397-.396 1.457-1.457a2 2 0 0 0 0-2.829l-.336-.335 1.776-1.775a.499.499 0 0 0 0-.708Zm-2.147 4.938-1.457 1.46L8.457 4.75l1.457-1.457a1 1 0 0 1 1.414 0l1.379 1.375a1 1 0 0 1 0 1.418v-.002Z"
      fill="currentColor"
    />
  </svg>
);

const PlugsConnected = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Plugs Connected"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14.854 1.146a.5.5 0 0 0-.708 0l-3.275 3.276-.335-.336a2.003 2.003 0 0 0-2.83 0L6.25 5.543l-.396-.397a.5.5 0 1 0-.708.708l.397.396-1.457 1.457a2 2 0 0 0 0 2.829l.336.335-3.276 3.275A.502.502 0 0 0 1.5 15a.501.501 0 0 0 .354-.146l3.275-3.276.335.336a2 2 0 0 0 2.83 0l1.456-1.457.396.397a.498.498 0 0 0 .816-.163.499.499 0 0 0-.108-.545l-.397-.396 1.457-1.457a2 2 0 0 0 0-2.829l-.336-.335 3.276-3.275a.499.499 0 0 0 0-.708ZM7.586 11.21a1 1 0 0 1-1.414 0l-1.379-1.38a1 1 0 0 1 0-1.415L6.25 6.957 9.043 9.75l-1.457 1.459Zm3.62-3.621L9.75 9.043 6.957 6.25l1.457-1.457a1 1 0 0 1 1.414 0l1.379 1.375a1 1 0 0 1 0 1.418v.002Zm-5.67-5.4a.5.5 0 1 1 .928-.376l.5 1.25a.5.5 0 0 1-.928.376l-.5-1.25Zm-4 3.624a.5.5 0 0 1 .652-.276l1.25.5a.5.5 0 1 1-.375.928l-1.25-.5a.5.5 0 0 1-.277-.652Zm12.928 4.375a.5.5 0 0 1-.65.28l-1.25-.5a.502.502 0 0 1 .373-.931l1.25.5a.5.5 0 0 1 .277.652Zm-4 3.63a.5.5 0 0 1-.928.37l-.5-1.25a.5.5 0 1 1 .928-.374l.5 1.253Z"
      fill="currentColor"
    />
  </svg>
);

const Copy = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Copy"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.5 2h-8a.5.5 0 0 0-.5.5V5H2.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V11h2.5a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5ZM10 13H3V6h7v7Zm3-3h-2V5.5a.5.5 0 0 0-.5-.5H6V3h7v7Z"
      fill="currentColor"
    />
  </svg>
);

const MCP = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "MCP"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13 8.5H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm0 4H3v-3h10v3Zm0-10H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm0 4H3v-3h10v3ZM12 5a.75.75 0 1 1-1.5 0A.75.75 0 0 1 12 5Zm0 6a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      fill="currentColor"
    />
  </svg>
);

const Lightning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Lightning"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.487 7.386a.5.5 0 0 0-.313-.354l-3.6-1.35.916-4.584a.5.5 0 0 0-.856-.437l-7 7.5a.5.5 0 0 0 .188.812l3.602 1.35-.914 4.579a.5.5 0 0 0 .856.437l7-7.5a.5.5 0 0 0 .12-.453Zm-6.651 5.989.654-3.274a.5.5 0 0 0-.312-.566l-3.303-1.24 5.289-5.667-.654 3.274a.5.5 0 0 0 .313.566l3.3 1.238-5.287 5.669Z"
      fill="currentColor"
    />
  </svg>
);

const ErrorOctagon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Error Octagon"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.5 8.5V5a.5.5 0 1 1 1 0v3.5a.5.5 0 0 1-1 0Zm7-2.778v4.556a.992.992 0 0 1-.293.707l-3.222 3.222a.992.992 0 0 1-.707.293H5.722a.992.992 0 0 1-.707-.293l-3.222-3.222a.992.992 0 0 1-.293-.707V5.722a.991.991 0 0 1 .293-.707l3.222-3.222a.991.991 0 0 1 .707-.293h4.556a.992.992 0 0 1 .707.293l3.222 3.222a.992.992 0 0 1 .293.707Zm-1 0L10.278 2.5H5.722L2.5 5.722v4.556L5.722 13.5h4.556l3.222-3.222V5.722ZM8 10a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"
      fill="currentColor"
    />
  </svg>
);

const InfoCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Info Circle"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.507 6.507 0 0 0 8 1.5Zm0 12A5.5 5.5 0 1 1 13.5 8 5.506 5.506 0 0 1 8 13.5ZM9 11a.5.5 0 0 1-.5.5 1 1 0 0 1-1-1V8a.5.5 0 0 1 0-1 1 1 0 0 1 1 1v2.5a.5.5 0 0 1 .5.5ZM7 5.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Z"
      fill="currentColor"
    />
  </svg>
);

const CaretRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Caret Right"}
    fill="currentColor"
    height={12}
    viewBox="0 0 12 12"
    width={12}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m8.515 6.265-3.75 3.75a.375.375 0 0 1-.53-.53L7.72 6 4.235 2.515a.375.375 0 0 1 .53-.53l3.75 3.75a.375.375 0 0 1 0 .53"
      fill="currentColor"
    />
  </svg>
);

const Globe = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Globe"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.507 6.507 0 0 0 8 1.5m5.476 6h-2.49c-.111-2.282-.99-3.896-1.71-4.85a5.51 5.51 0 0 1 4.2 4.85m-7.462 1h3.972C9.84 11.1 8.596 12.694 8 13.313c-.597-.62-1.841-2.213-1.986-4.813m0-1C6.16 4.9 7.404 3.306 8 2.688c.597.62 1.841 2.214 1.986 4.812zm.71-4.85c-.72.954-1.599 2.568-1.71 4.85h-2.49a5.51 5.51 0 0 1 4.2-4.85m-4.2 5.85h2.49c.113 2.282.99 3.896 1.71 4.85a5.51 5.51 0 0 1-4.2-4.85m6.75 4.85c.72-.954 1.597-2.568 1.71-4.85h2.49a5.51 5.51 0 0 1-4.198 4.85z"
      fill="currentColor"
    />
  </svg>
);

const GlobeX = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Globe X"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.854 10.854 12.707 12l1.147 1.146a.5.5 0 0 1-.708.708L12 12.707l-1.146 1.147a.5.5 0 0 1-.708-.708L11.293 12l-1.147-1.146a.5.5 0 1 1 .708-.708L12 11.293l1.146-1.147a.5.5 0 1 1 .708.708M14.5 8a.5.5 0 0 1-.5.5H6.016c.187 3.358 2.208 5.038 2.298 5.11A.5.5 0 0 1 8 14.5 6.5 6.5 0 1 1 14.5 8M9.276 2.65c.72.954 1.599 2.568 1.71 4.85h2.49a5.51 5.51 0 0 0-4.2-4.85M8 2.688C7.404 3.308 6.159 4.9 6.014 7.5h3.972C9.84 4.9 8.596 3.306 8 2.688M2.523 7.5h2.49c.112-2.282.99-3.896 1.711-4.85a5.51 5.51 0 0 0-4.2 4.85m2.49 1h-2.49a5.51 5.51 0 0 0 4.201 4.85c-.72-.954-1.599-2.568-1.71-4.85"
      fill="currentColor"
    />
  </svg>
);

const Minimize = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Minimize"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.354 3.354 10.207 6.5H12a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 1 0v1.793l3.146-3.147a.5.5 0 0 1 .708.708M7 8.5H4a.5.5 0 0 0 0 1h1.793l-3.147 3.146a.5.5 0 1 0 .708.708L6.5 10.207V12a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5"
      fill="currentColor"
    />
  </svg>
);

const Maximize = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Maximize"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.5 3v2.5a.5.5 0 0 1-1 0v-2h-2a.5.5 0 0 1 0-1H13a.5.5 0 0 1 .5.5m-8 9.5h-2v-2a.5.5 0 0 0-1 0V13a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 0-1M13 10a.5.5 0 0 0-.5.5v2h-2a.5.5 0 0 0 0 1H13a.5.5 0 0 0 .5-.5v-2.5a.5.5 0 0 0-.5-.5M5.5 2.5H3a.5.5 0 0 0-.5.5v2.5a.5.5 0 1 0 1 0v-2h2a.5.5 0 1 0 0-1"
      fill="currentColor"
    />
  </svg>
);

const Github = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Github"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.02 4.73a3.74 3.74 0 0 0-.337-2.98.5.5 0 0 0-.433-.25 3.73 3.73 0 0 0-3 1.5h-1.5a3.73 3.73 0 0 0-3-1.5.5.5 0 0 0-.433.25 3.74 3.74 0 0 0-.336 2.98A3.63 3.63 0 0 0 3.5 6.5V7a3.504 3.504 0 0 0 3.028 3.467A2.5 2.5 0 0 0 6 12v.5H4.5A1.5 1.5 0 0 1 3 11 2.5 2.5 0 0 0 .5 8.5a.5.5 0 0 0 0 1A1.5 1.5 0 0 1 2 11a2.5 2.5 0 0 0 2.5 2.5H6v1a.5.5 0 1 0 1 0V12a1.5 1.5 0 0 1 3 0v2.5a.5.5 0 0 0 1 0V12c0-.556-.185-1.095-.527-1.533A3.504 3.504 0 0 0 13.5 7v-.5a3.63 3.63 0 0 0-.48-1.77M12.5 7A2.5 2.5 0 0 1 10 9.5H7A2.5 2.5 0 0 1 4.5 7v-.5c.006-.5.156-.988.431-1.405A.5.5 0 0 0 5 4.615a2.74 2.74 0 0 1 .05-2.1A2.74 2.74 0 0 1 7.07 3.77a.5.5 0 0 0 .418.23H9.51a.5.5 0 0 0 .42-.23 2.74 2.74 0 0 1 2.02-1.254A2.74 2.74 0 0 1 12 4.614a.5.5 0 0 0 .063.478c.278.418.43.907.437 1.408z"
      fill="currentColor"
    />
  </svg>
);

const Document = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Document"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m13.354 5.146-3.5-3.5A.5.5 0 0 0 9.5 1.5h-6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-8a.5.5 0 0 0-.146-.354M10 3.206 11.793 5H10zM12.5 13.5h-9v-11H9v3a.5.5 0 0 0 .5.5h3zm-2-5a.5.5 0 0 1-.5.5H6a.5.5 0 1 1 0-1h4a.5.5 0 0 1 .5.5m0 2a.5.5 0 0 1-.5.5H6a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5"
      fill="currentColor"
    />
  </svg>
);

const EnterKey = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Enter Key"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.938 7.313v2.25a.563.563 0 0 1-.563.562H6.983l.727.727a.563.563 0 0 1-.795.796L5.227 9.96a.56.56 0 0 1 0-.795l1.688-1.688a.563.563 0 0 1 .795.796L6.983 9h4.83V7.313a.563.563 0 0 1 1.124 0m3.374-3.375v10.125a1.125 1.125 0 0 1-1.125 1.124H2.813a1.125 1.125 0 0 1-1.126-1.124V3.938a1.125 1.125 0 0 1 1.126-1.126h12.375a1.125 1.125 0 0 1 1.124 1.126m-1.125 10.125V3.938H2.813v10.125z"
      fill="currentColor"
    />
  </svg>
);

const Mail = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label={props["aria-label"] ?? "Mail"}
    fill="currentColor"
    height={16}
    viewBox="0 0 16 16"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 3H2a.5.5 0 0 0-.5.5V12a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V3.5A.5.5 0 0 0 14 3m-1.286 1L8 8.322 3.286 4zm.786 8h-11V4.637l5.162 4.732a.5.5 0 0 0 .676 0L13.5 4.637z"
      fill="currentColor"
    />
  </svg>
);

const iconMap = {
  plugsDisconnected: PlugsDisconnected,
  plugsConnected: PlugsConnected,
  copy: Copy,
  mcp: MCP,
  lightning: Lightning,
  errorOctagon: ErrorOctagon,
  infoCircle: InfoCircle,
  caretRight: CaretRight,
  globe: Globe,
  globeX: GlobeX,
  minimize: Minimize,
  maximize: Maximize,
  github: Github,
  document: Document,
  enterKey: EnterKey,
  mail: Mail,
} as const;
